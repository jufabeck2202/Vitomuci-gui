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
      if (err) { reject('Network error', err) }

      parsePodcast(data, (err, data) => {
        if (err) { reject('Parsing error', err) }

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
 * Gets the title of a video
 * @param {} url
 */
async function getVideoTitle (url) {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url, (err, info) => {
      if (err) throw reject(err)
      console.log(info)
      resolve(info)
    })
  })
}

/**
 * Returns list of podcast or youtube videos
 * @param {*} url url to podcast or rss feed
 */
async function getContent (url) {
  // Download yt videos
  if (isUrl(url)) {
    let episodes = []
    if (url.indexOf('https://www.youtube.com/') >= 0) {
      // check if single video or playlist
      try {
        episodes = await getPlaylist(url)
        // info =await getVideoTitle("https://www.youtube.com/watch?v=LL9kcGra9Rs")
      } catch (error) {
      }
      return episodes
    } else {
      // check for podcast
      let rss
      try {
        rss = await getRSS(url)
        rss.episodes.forEach(episode => {
          episodes.push({name: episode.title, url: episode.enclosure.url})
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
