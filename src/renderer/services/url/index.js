const isUrl = require("is-url");
const ytlist = require("youtube-playlist");
const parsePodcast = require('node-podcast-parser');
const path = require("upath");


/**
 * 
 * @param {String} url to the rss feed  
 * @returns {Array} array of podcast episodes
 */
function getRSS(url) {
    return new Promise((resolve, reject) => {
        request(url, (err, res, data) => {
            if (err)
                reject('Network error', err);

            parsePodcast(data, (err, data) => {
                if (err)
                    reject('Parsing error', err);

                resolve(data);
            });
        });
    });
}


/**
 * Returns array of links if url is a playlist
 * @param {String} url of the youtube video 
 */
async function getPlaylist(url) {
    return new Promise((resolve, reject) => {
        ytlist(url, "url").then(res => {
            resolve(res.data.playlist);
        });
    });
}


async function getContent(url){

    //Download yt videos
    if (isUrl(url)) {
        if (url.indexOf("https://www.youtube.com/") >= 0) {
            //run get playlist
            let videos

            //check if single video or playlist
            try {
                videos = await getPlaylist(url);
                if (videos.length == 0) videos = [url];
            } catch (error) {
                console.log(error);
                videos = [url];
            }
            return videos;
        } else {
            //check for podcast
            let rss
            try {
                rss = await getRSS(url);
            } catch (error) {
                throw (url + " is not a YouTube or RSS feed url");
            }
            return rss
            //create podcast output folder
        }

    }
}
export default {
    getContent
  }