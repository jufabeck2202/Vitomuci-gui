const path = require("upath");
const fs = require("fs");
const ffprobe = require("./../node-ffprobe");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const chalk = require("chalk");


let ffmetadata;
let options
let clips = []

async function split(output, files, optionsObj) {
    options = optionsObj
    //convert spring to seconds
    options.startAt = stringToSeconds(options.startAt);
    options.endAt = stringToSeconds(options.endAt);
    options.duration = stringToSeconds(options.duration);
    //Split track
    output = path.join(output, options.outputFolder)
    fs.mkdirSync(output)
    for (let file of files) {
        let seconds = await getFileLength(file.path);
        await splitTrack(output, file, Number(seconds));
    }
    console.log("Finished Splitting")

    //set metadata name to first file in array if not set
    if (options.name === "") {
        options.name = files[0].name;
    }
    //take cover picture
    if (options.cover)
        coverPath = await getCoverPicture(files[0], output, options.startAt);

    //updating meta data, combines Clips into album
    if (options.metadata) {
        files = fs.readdirSync(outputDirectory);
        for (let file of files) {
            await writeMusicMetadata(path.join(outputDirectory, file), options.name, coverPath);
        }
    }

    if (options.cover) await deleteFile(coverPath);
    return clips
}

/**
 * Sets the required ffmpeg path to all 
 * packages that require it
 */
function checkffmpeg() {
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
    process.env.FFMPEG_PATH = ffmpegPath;
    ffprobe.FFPROBE_PATH = ffprobePath;
    ffmetadata = require("ffmetadata");
    console.log(chalk.grey("ffmpeg installed at:" + ffmpegPath));
    return ffmpegPath;
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
function segmentMp3(input, output, start, duration) {
    return new Promise((resolve, reject) => {
        ffmpeg(input).seekInput(start).duration(duration).save(output)
            .on("end", function (stdout, stderr) {
                resolve();
            }).on('error', function (err, stdout, stderr) {
                reject('Cannot process video: ' + err.message);
            });
    });
};


/**
 * Splits a mp3 file into multiple smaller sized parts and renames them
 * if part is shorter than 30 seconds it gets skipped
 * @param {String} baseDirectory 
 * @param {String} outputDirectory 
 * @param {String} name 
 * @param {Number} duration 
 */
async function splitTrack(outputDirectory, file, duration) {
    //if you dont want seprate clips
    if (options.full) {
        let ext = path.extname(file.name);
        let newName = path.removeExt(file.name, ext);
        await segmentMp3(file.path, path.join(outputDirectory, newName + ".mp3"), 0, duration);
        clips.push({
            name: newName,
            path: path.join(outputDirectory, newName + ".mp3")
        })
        return;
    }

    let durationIndex = options.startAt;
    while ((durationIndex + options.duration) <= (duration - options.endAt)) {
        await segmentMp3(file.path, path.join(outputDirectory, getSegmentName(file.name, durationIndex, durationIndex + options.duration)), durationIndex, options.duration);
        clips.push({
            name: getSegmentName(file.name, durationIndex, durationIndex + options.duration),
            path: path.join(outputDirectory, getSegmentName(file.name, durationIndex, durationIndex + options.duration))
        })
        durationIndex += options.duration;

    }
    if (((duration - options.endAt) - durationIndex) >= 30) {
        await segmentMp3(file.path, path.join(outputDirectory, getSegmentName(file.name, durationIndex, duration - options.endAt)), durationIndex, options.duration);
        clips.push({
            name: getSegmentName(file.name, durationIndex, durationIndex + options.duration),
            path: path.join(outputDirectory, getSegmentName(file.name, durationIndex, durationIndex + options.duration))
        })

    }

}


/**
 * Generates Name for a Segment
 * @param {String} name 
 * @param {Number} start 
 * @param {Number} end 
 */
function getSegmentName(name, start, end) {
    let ext = path.extname(name);
    name = path.removeExt(name, ext);
    return `${name}_${secondsToTimeString(start)}-${secondsToTimeString(end)}.mp3`;
}


/**
 * Converts seconds into a ISO time string 
 * @param {Number} seconds 
 */
function secondsToTimeString(seconds) {
    return new Date(seconds * 1000).toISOString().substr(14, 5).replace(":", ".");

}

/**
 * Returns seconds from strings like 00:00 or 10000
 * @param {String} timeString 
 */
function stringToSeconds(timeString) {
    let seconds = 0;
    if (!isNaN(timeString))
        seconds = timeString;
    else if (typeof timeString === "string" || timeString instanceof String) {
        if (timeString.indexOf(":") > -1) {
            let ms = timeString.split(":");
            seconds = (+ms[0]) * 60 + (+ms[1]);
        }
    } else
        throw timeString + " is not a number, please only use formats like 123 or 1:30";

    return Number(seconds);
}


/**
 * Returns the duration of a given 
 * media file
 * @param {*} file 
 */
function getFileLength(file) {
    return new Promise((resolve, reject) => {
        ffprobe(file, (err, probeData) => {
            if (err) reject(err);
            resolve(probeData.format.duration);
        });
    });
}


/**
 * Writes music meta data and cover to the given file
 * Also sets disc:1 to join all mp3 files into one copilation
 * @param {String} file 
 * @param {String} compilationName 
 * @param {String} cover 
 */
function writeMusicMetadata(file, compilationName, cover) {
    return new Promise((resolve, reject) => {

        let isodate = new Date();
        let data = {
            artist: compilationName,
            genre: "speech",
            disc: 1,
            album: compilationName,
            date: isodate
        };

        let attachments = options.cover ? {
            attachments: [cover]
        } : {};

        ffmetadata.write(file, data, attachments, function (err) {
            if (err) reject(err);
            resolve();
        });
    });
}


/**
 * Takes a picture from a media file and saves it as
 * cover.jpg used to generate a cover
 * @param {String} file 
 * @param {String} baseDirectory 
 * @param {String} picTime 
 */
function getCoverPicture(file, baseDirectory, picTime) {
    return new Promise((resolve, reject) => {
        ffmpeg(file)
            .screenshots({
                timestamps: [picTime],
                filename: path.join(baseDirectory, "cover.jpg"),
                size: "320x240"
            }).on("end", function (stdout, stderr) {
                resolve(path.join(baseDirectory, "cover.jpg"));
            }).on('error', function (err, stdout, stderr) {});;
    });
};


/**
 * Promise wrap for deleting a file
 * @param {*} file 
 */
function deleteFile(file) {
    return new Promise((resolve, reject) => {
        fs.unlink(file, function (error) {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
}


/**
 * Cleans up the filename of the given files
 * Removes Brackets and the text inside them
 * @param {Array} files 
 */
function rename(files) {

    let renamedFiles = [];
    files.forEach(function (file) {
        let removeRound = basename.replace(/ *\([^)]*\) */g, "");
        let removeSquare = removeRound.replace(/ *\[[^)]*\] */g, "");
        let newName = path.join(curDir, removeSquare);
        renamedFiles.push(newName);
        fs.renameSync(file, newName);
    });
    return renamedFiles;
}


export default {
    split,
    checkffmpeg,
    rename
}