import {
  duration
} from 'moment'
import split from '../split'

const path = require('upath')
const fs = require('fs')
const fileExists = require('file-exists')

const videoFormats = ['.txt', '.mp3', '.mkv', '.mp4', '.avi', '.wmv', '.mov', '.amv', '.mpg', '.flv']
let videos = []

/**
 * Searches for files inside input,
 * or search for matching files if a regex
 * gets inputed
 * @param {String} input directory or file
 * @returns {Promise} array with files
 */
async function getFiles (files, modal) {
  try {
    let foundFiles = []
    for (const file of files) {
      if (fs.lstatSync(file.path).isDirectory()) {
        let folderFiles = fs.readdirSync(file.path)
        for (const item of folderFiles) {
          let duration = await split.getFileLength(file.path)
          foundFiles.push({
            name: path.basename(item, path.extname(item)),
            path: path.join(file.path, item),
            duration: duration
          })
        }
        return foundFiles
      } else if (fileExists.sync(file.path)) {
        let duration = await split.getFileLength(file.path)
        foundFiles.push({
          name: path.basename(file.name, path.extname(file.name)),
          path: file.path,
          duration: duration
        })
      }
      modal.progress++
    }
    return foundFiles.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) { console.log(error) }
}

/**
 * Checks if found files are media files
 * @param {Array} files array of files
 */
function verifyFiles (files) {
  let mediaFiles = []
  files.forEach(file => {
    if (videoFormats.includes(path.extname(file.path))) {
      mediaFiles.push(file)
    }
  })
  return mediaFiles
}

function set (v) {
  videos = v
}

function get () {
  return videos
}

function clear () {
  videos = []
}

export default {
  getFiles,
  verifyFiles,
  set,
  get,
  clear
}
