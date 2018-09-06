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

async function download(output){
    for (let episode of episodes) {
        if (ytdl.validateURL(episode.url)) {
            let title = episode.title.replace(/[/\\?%*:|"<>&]/g, "-"); //make sure there are no illeagale characters
            await downloadVideo(episode.url, path.join(output, title + ".mp4"));
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

export default {
    set,
    get,
    clear,
    download
}