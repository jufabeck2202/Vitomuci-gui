const path = require('upath')
const fs = require('fs')
const ffprobe = require('./../node-ffprobe')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffprobePath = require('@ffprobe-installer/ffprobe').path

let ffmetadata
let options
let output
let clips = []
let coverPath = ''
let modal

async function split (files, optionsObj, outputPath, progressObj) {
  options = optionsObj
  modal = progressObj   
  // convert spring to seconds
  options.startAt = stringToSeconds(options.startAt)
  options.endAt = stringToSeconds(options.endAt)
  options.duration = stringToSeconds(options.duration)
  // rename
  if (options.rename) { files = rename(files) }
  console.log(files)

  // Split track
  output = path.join(outputPath, options.outputFolder)
  fs.mkdirSync(output)
  for (let file of files) {
    let seconds = await getFileLength(file.path)
    await splitTrack(output, file, Number(seconds))
    modal.progress++
  }

  // set metadata name to first file in array if not set
  if (options.name === '') {
    options.name = files[0].name
  }
  // take cover picture
  if (options.cover) {
    coverPath = await getCoverPicture(files[0].path, output, options.startAt)
  }

  // updating meta data, combines Clips into album
  if (options.metadata) {
    modal.info = `updating metadata of ${clips.length} files` 
    for (let i in clips) {
      await writeMusicMetadata(clips[i].path, options.name, ++i + '/' + clips.length, coverPath)
    }
  }

  if (options.cover) await deleteFile(coverPath)
  return clips
}

/**
 * Sets the required ffmpeg path to all
 * packages that require it
 */
function checkffmpeg () {
  ffmpeg.setFfmpegPath(ffmpegPath)
  ffmpeg.setFfprobePath(ffprobePath)
  process.env.FFMPEG_PATH = ffmpegPath
  ffprobe.FFPROBE_PATH = ffprobePath
  ffmetadata = require('ffmetadata')
  return ffmpegPath
}

/**
 * Extracts one clip out of a longer mp3 file using the
 * seekInput and duration fuction.
 * Gets called when splitting up a larger file smaller ones
 * @param {String} input
 * @param {String} output
 * @param {Number} start
 * @param {Number} duration
 */
function segmentMp3 (input, output, start, duration) {
  return new Promise((resolve, reject) => {
    ffmpeg(input).seekInput(start).duration(duration).save(output)
      .on('end', function (stdout, stderr) {
        resolve()
      }).on('error', function (err, stdout, stderr) {
        reject('Cannot process video: ' + err.message)
      })
  })
};

/**
 * Splits a mp3 file into multiple smaller sized parts and renames them
 * if part is shorter than 30 seconds it gets skipped
 * @param {String} baseDirectory
 * @param {String} outputDirectory
 * @param {String} name
 * @param {Number} duration
 */
async function splitTrack (outputDirectory, file, duration) {
  modal.info = `converting ${file.name}` 
  // if you dont want seprate clips
  if (options.full) {
    let ext = path.extname(file.name)
    let newName = path.removeExt(file.name, ext)
    await segmentMp3(file.path, path.join(outputDirectory, newName + '.mp3'), 0, duration)
    clips.push({
      name: newName,
      path: path.join(outputDirectory, newName + '.mp3')
    })
    return
  }

  let durationIndex = options.startAt
  let parts = 0
  while ((durationIndex + options.duration) <= (duration - options.endAt)) {
    modal.info = `converting ${file.name} splitting into ${parts} parts` 
    await segmentMp3(file.path, path.join(outputDirectory, getSegmentName(file.name, durationIndex, durationIndex + options.duration)), durationIndex, options.duration)
    clips.push({
      name: getSegmentName(file.name, durationIndex, durationIndex + options.duration),
      path: path.join(outputDirectory, getSegmentName(file.name, durationIndex, durationIndex + options.duration))
    })
    durationIndex += options.duration
    parts++
  }
  // still add 1 min clips
  if (((duration - options.endAt) - durationIndex) >= 60) {
    modal.info = `converting ${file.name} splitting into ${parts} parts` 
    await segmentMp3(file.path, path.join(outputDirectory, getSegmentName(file.name, durationIndex, duration - options.endAt)), durationIndex, (duration - options.endAt) - durationIndex)
    clips.push({
      name: getSegmentName(file.name, durationIndex, durationIndex + options.duration),
      path: path.join(outputDirectory, getSegmentName(file.name, durationIndex, duration - options.endAt))
    })
    parts++
  }
}

/**
 * Generates Name for a Segment
 * @param {String} name
 * @param {Number} start
 * @param {Number} end
 */
function getSegmentName (name, start, end) {
  let ext = path.extname(name)
  return `${path.basename(name,ext)}_${secondsToTimeString(start)} to ${secondsToTimeString(end)}.mp3`.replace(/[/\\?%*:|"<>&]/g, '-')
}

/**
 * Converts seconds into a ISO time string
 * @param {Number} seconds
 */
function secondsToTimeString (seconds) {
  let time = new Date(seconds * 1000).toISOString()//.substr(11, 5)
  //if(time.substr(12,1)=="0")
    //return time.substr(14,5)
  return time.substr(11,8)
}

/**
 * Returns seconds from strings like 00:00 or 10000
 * @param {String} timeString
 */
function stringToSeconds (timeString) {
  let seconds = 0
  if (!isNaN(timeString)) {
    seconds = timeString
  } else if (typeof timeString === 'string' || timeString instanceof String) {
    if (timeString.indexOf(':') > -1) {
      let ms = timeString.split(':')
      seconds = (+ms[0]) * 60 + (+ms[1])
    }
  } else {
    throw timeString + ' is not a number, please only use formats like 123 or 1:30'
  }

  return Number(seconds)
}

/**
 * Returns the duration of a given
 * media file
 * @param {*} file
 */
function getFileLength (file) {
  return new Promise((resolve, reject) => {
    ffprobe(file, (err, probeData) => {
      if (err) reject(err)
      resolve(probeData.format.duration)
    })
  })
}

/**
 * Writes music meta data and cover to the given file
 * Also sets disc:1 to join all mp3 files into one copilation
 * @param {String} file
 * @param {String} compilationName
 * @param {String} cover
 */
function writeMusicMetadata (file, compilationName, track, cover) {
  return new Promise((resolve, reject) => {
    let isodate = new Date()
    let data = {
      artist: path.basename(compilationName,path.extname(compilationName)),
      genre: 'Speech',
      disc: 1,
      album: path.basename(compilationName,path.extname(compilationName)),
      date: isodate,
      track: track
    }

    let attachments = options.cover ? {
      attachments: [cover]
    } : {}
    ffmetadata.write(file, data, attachments, function (err) {
      if (err) reject(err)
      resolve()
    })
  })
}

/**
 * Takes a picture from a media file and saves it as
 * cover.jpg used to generate a cover
 * @param {String} file
 * @param {String} baseDirectory
 * @param {String} picTime
 */
function getCoverPicture (file, baseDirectory, picTime) {
  return new Promise((resolve, reject) => {
    ffmpeg(file)
      .screenshots({
        timestamps: [picTime + 10],
        filename: path.join(baseDirectory, 'cover.jpg'),
        size: '320x240'
      }).on('end', function (stdout, stderr) {
        resolve(path.join(baseDirectory, 'cover.jpg'))
      }).on('error', function (err, stdout, stderr) {})
  })
};

/**
 * Promise wrap for deleting a file
 * @param {*} file
 */
function deleteFile (file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, function (error) {
      if (error) {
        reject(error)
      }
      resolve()
    })
  })
}

/**
 * Cleans up the filename of the given files
 * Removes Brackets and the text inside them
 * @param {Array} files
 */
function rename (files) {
  let renamedFiles = []
  for (const file of files) {
    let removeRound = path.basename(file.name.replace(/ *\([^)]*\) */g, ''),path.extname(file.name))
    let removeSquare = removeRound.replace(/ *\[[^)]*\] */g, '')
    let removeSwift = removeSquare.replace(/ *\{[^)]*\} */g, '')
    let removeRaw = removeSwift.replace(' RAW', '')

    let newPath = path.join(path.dirname(file.path), removeRaw + path.extname(file.path))
    fs.renameSync(file.path, newPath)
    renamedFiles.push({name: removeRaw, path: newPath})
  }
  return renamedFiles
}

export default {
  split,
  checkffmpeg,
  getFileLength,
  secondsToTimeString
}
