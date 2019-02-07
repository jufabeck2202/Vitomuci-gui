
const isUrl = require('is-url')
const ytlist = require('youtube-playlist')
const parsePodcast = require('node-podcast-parser')
const request = require('request')
const ytdl = require('ytdl-core')

/**
 *
 * @param {String} url to the rss feed
 * @returns {Array} array of podcast episodes
 */
function getRSS (url) {
  return new Promise((resolve, reject) => {
    request(url, (err, res, data) => {
      if (err) {
        reject('Network error', err)
      }

      parsePodcast(data, (err, data) => {
        if (err) {
          reject('Parsing error', err)
        }

        resolve(data)
      })
    })
  })
}

/**
 * Returns array of episodes, title and url
 * @param {String} url of the youtube video
 */
async function getPlaylist (url) {
  return new Promise((resolve, reject) => {
    ytlist(url, 'url').then(urls => {
      ytlist(url, 'name').then(title => {
        let episodes = []
        for (let i = 0; i < urls.data.playlist.length; i++) {
          episodes.push({
            name: title.data.playlist[i],
            url: urls.data.playlist[i]
          })
        }
        resolve(episodes)
      })
    })
  })
}

/**
 * Gets the duration of a video
 * @param {} url
 */
async function getVideoDuration (url) {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url, (err, info) => {
      if (err) throw reject(err)
      resolve(info.length_seconds)
    })
  })
}

/**
 * Gets the title of a video
 * @param {} url
 */
async function getVideoTitle (url) {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url, (err, info) => {
      if (err) throw reject(err)
      resolve(info.title)
    })
  })
}

/**
 * Returns list of podcast or youtube videos
 * @param {*} url url to podcast or rss feed
 */
async function getContent (url, modal) {
  // Check if url
  if (isUrl(url)) {
    let episodes = []
    if (url.indexOf('https://www.youtube.com/') >= 0) {
      // check if single video or playlist
      try {
        episodes = await getPlaylist(url)
        modal.goal = episodes.length
        for (const i in episodes) {
          try {
            modal.progress++
            episodes[i].duration = await getVideoDuration(episodes[i].url)
          } catch (error) {
            episodes.splice(i, 1)
          }
        }
      } catch (error) {
        // check single url
        try {
          modal.goal = 1
          let duration = await getVideoDuration(url)
          let name = await getVideoTitle(url)
          episodes.push({name: name, url: url, duration: duration})
          modal.progress++
        } catch (error) {
          episodes = []
        }
      }
      return episodes
    } else {
      // check for podcast
      let rss
      try {
        rss = await getRSS(url)
        modal.goal = rss.episodes.length
        rss.episodes.forEach(episode => {
          episodes.push({
            name: episode.title,
            url: episode.enclosure.url,
            duration: episode.duration
          })
          modal.progress++
        })
        return episodes
      } catch (error) {
        throw (url + ' is not a YouTube or RSS feed url')
      }
    }
  }
}

export default {
  getContent
}
