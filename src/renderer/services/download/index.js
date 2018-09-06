const ytdl = require("ytdl-core");
const path = require("upath");
const fs = require("fs");

let episodes = [];

function set(e) {
    episodes = e
}

function get() {
    return episodes
}

function clear() {
    episodes = []
}

async function download(output) {
    if (episodes[0].url.indexOf("https://www.youtube.com/") >= 0) {
        for (let episode of episodes) {
            if (ytdl.validateURL(episode.url)) {
                let title = episode.title.replace(/[/\\?%*:|"<>&]/g, "-"); //make sure there are no illeagale characters
                await downloadVideo(episode.url, path.join(output, title + ".mp4"));
            }
        }
    } else {
        for (const episode of episodes) {
            await downloadPodcast(episode.url, path.join(output, episode.title.replace(/[/\\?%*:|"<>&]/g, "-") + ".mp3"));
        }
    }


}

/**
 * Downloads youtube video and saves it as mp4
 * @param {String} url of the youtube video
 * @param {String} dir where the video should be placed
 */
async function downloadVideo(url, dir) {
    return new Promise((resolve, reject) => {
        ytdl(url)
            .pipe(fs.createWriteStream(dir)).on("finish", () => {
                resolve(dir);
            });
    });
}

/**
 * 
 * @param {String} path and name where the download should be stored
 * @param {String} url to the podcast
 */
function downloadPodcast(url, path) {
    return new Promise((resolve, reject) => {
        request(url).pipe(fs.createWriteStream(path)).on('finish', function () {
            resolve(path)
        }).on('error', function (error) {
            reject(error);
        });
    });
}

export default {
    set,
    get,
    clear,
    download
}