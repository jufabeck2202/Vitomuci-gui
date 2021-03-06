<template>
  <div id="wrapper">
    <div class="container text-center logo">
      <img src="../assets/logo.png" alt width="400px">
    </div>
    <hr class="container" style="margin-bottom:20px">
    <main>
      <div class="row">
        <div class="col">
          Download Youtube Playlist or Podcast from Rss feed
          <input
            type="text"
            v-model="url"
            class="form-control"
            placeholder="youtube url or podcast rss feed"
          >
          <button type="button" class="btn btn-primary" v-on:click="searchUrl">Download</button>
        </div>
        <div class="col">
          <div class="row">
            <div class="col">
              <div
                class="icon-choose-image btn btn-block btn-outline-primary waves-effect file-btn"
              >
                <i class="fa fa-upload pr-2" aria-hidden="true"></i>
                <span>Choose file(s)…</span>
                <input
                  class="file-input"
                  multiple
                  type="file"
                  name="resume"
                  @change="handleFileChange"
                >
              </div>
            </div>
            <div class="col">
              <div
                class="icon-choose-image btn btn-block btn-outline-primary waves-effect file-btn"
              >
                <i class="fa fa-upload pr-2" aria-hidden="true"></i>
                <span>Choose folder…</span>
                <input
                  class="file-input"
                  type="file"
                  name="resume"
                  webkitdirectory
                  directory
                  @change="handleFileChange"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    <file-dropdown v-bind:dropFiles="verifyFiles"></file-dropdown>
    </main>
    
    <modal name="progress" height="auto" :clickToClose="false" :adaptive="true">
      <div class="box">
        <h4>Scanning files...</h4>
        <div class="progress">
          <div
            class="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            aria-valuenow="0"
            :style="{ 'width': ((100/modal.goal)*modal.progress)+'%' }"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    </modal>
    <modal name="ffmpegDownload" height="auto" :clickToClose="false" :adaptive="true">
      <div class="box">
        <h4>Downloading ffmpeg</h4>
        <div class="progress">
          <div
            class="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            aria-valuenow="0"
            :style="{ 'width': (ffmpegDownloadProgress*100)+'%' }"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
import FileDropdown from './LandingPage/FileDropdown'
import Videos from '@/services/videos'
import Url from '@/services/url'
import Download from '@/services/download'
import Split from '@/services/split'
const { app } = require('electron').remote

const path = require('upath')
const ffbinaries = require('ffbinaries')

export default {
  name: 'landing-page',
  beforeRouteEnter (to, from, next) {
    Download.clear()
    Split.clear()
    Videos.clear()
    next()
  },
  data () {
    return {
      url:
        'https://www.youtube.com/playlist?list=PLfpHPxe91z9NEwLMsxfmAehlZnoTzRFB8',
      modal: {
        progress: 0,
        goal: 0
      },
      ffmpegDownloadProgress: 0,
      binariesDownloaded: false
    }
  },
  track () {
    this.$ga.page('/')
  },
  components: {
    FileDropdown
  },
  mounted () {
    let dest = path.join(app.getPath('userData'), 'ff')
    // check if binaries are found:
    let binaries = ffbinaries.locateBinariesSync(['ffmpeg', 'ffprobe'], {
      paths: dest
    })
    if (
      binaries.ffmpeg.found &&
      binaries.ffprobe.found &&
      binaries.ffmpeg.isExecutable &&
      binaries.ffprobe.isExecutable
    ) {
      this.binariesDownloaded = true
      this.setFfPath()
    } else {
      // download ffmpeg from cache or site
      let platform = ffbinaries.detectPlatform()
      this.$modal.show('ffmpegDownload')
      ffbinaries.downloadFiles(
        ['ffmpeg', 'ffprobe'],
        {
          platform: platform,
          quiet: false,
          destination: dest,
          tickerFn: this.ffbinariesProgress
        },
        (err, data) => {
          this.setFfPath()
          this.$modal.hide('ffmpegDownload')
        }
      )
    }
  },
  methods: {
    searchUrl () {
      // initialize progress modal
      this.$modal.show('progress')
      Url.getContent(this.url, this.modal).then(episodes => {
        if (episodes === undefined || episodes.length === 0) {
          new Notification('Wrong url format', {
            body: 'Please, insert youtube or podcast url'
          })
          return
        }
        // start download
        // switch to download screen
        Download.set(episodes)
        this.$router.push('download')
      })
    },
    setFfPath () {
      let platform = ffbinaries.detectPlatform()
      let dest = path.join(app.getPath('userData'), 'ff')
      let ffmpegPath = path.join(
        dest,
        ffbinaries.getBinaryFilename('ffmpeg', platform)
      )
      let ffprobePath = path.join(
        dest,
        ffbinaries.getBinaryFilename('ffprobe', platform)
      )
      Split.checkffmpeg(ffmpegPath, ffprobePath)
    },
    handleFileChange (e) {
      // Whenever the file changes, emit the 'input' event with the file data.
      this.verifyFiles(e.target.files)
    },
    verifyFiles (newFiles) {
      // initialize progress modal
      this.modal.goal = newFiles.length
      this.$modal.show('progress')
      Videos.getFiles(newFiles, this.modal).then(files => {
        if (
          files == 'undefined' ||
          !files.length ||
          files.length === 'undefined'
        ) {
          this.$modal.hide('progress')
          new Notification('Wrong format', {
            body: 'Please, drop a video(s)',
            // TODO: fix icon path
            icon: path.join(__dirname, '/dist/imgs/logo--assets.png')
          })
          return
        }
        Videos.set(files)
        this.$router.push('videos')
      })
    },
    ffbinariesProgress (data) {
      console.log('Downloading ' + (data.progress * 100).toFixed(1))
      this.ffmpegDownloadProgress = data.progress
    }
  }
}
</script>

<style>
.file-btn {
  position: relative;
}

.file-btn input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.strike {
  display: block;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}

.strike > span {
  position: relative;
  display: inline-block;
}

.strike > span:before,
.strike > span:after {
  content: "";
  position: absolute;
  top: 50%;
  width: 9999px;
  height: 1px;
  background: gray;
}

.strike > span:before {
  right: 100%;
  margin-right: 15px;
}

.strike > span:after {
  left: 100%;
  margin-left: 15px;
}

.logo {
  margin-top: 30px;
  margin-bottom: 30px;
}
#wrapper {
  margin-left: 20px;
  margin-right: 20px;
}
</style>