<template>
  <div>
    <div class="row">
      <div class="col video-col">
        <div class="card card-left">
          <div class="card-body">
            <virtual-list :size="50" :remain="8" bench="20" wtag="ul" class="list">
              <li class="list-group-item cut-text" v-for="(episode) in episodes" :key="episode.xxx">{{options.rename?renamePreview(episode.name):episode.name}}<span
                  class="float-right">{{secondsToTimeString(episode.duration)}}</span></li>
            </virtual-list>
          </div>
        </div>
      </div>

      <div class="col-5">
        <div class="card card-right">
          <div class="card-body">
            <h3 class="card-title">Settings</h3>
            <h6 class="card-title">Average Duration: {{averageDuration}}</h6>
            <!-- Default form login -->
            <form class="">
              <!-- Create cover checkbox-->
              <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" v-model="options.cover" id="cover">
                <label class="custom-control-label" for="cover">Create Cover</label>
              </div>
              <!-- rename ceckbox-->
              <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" v-model="options.rename" id="rename">
                <label class="custom-control-label" for="rename">remove {}()[] from filenames</label>
              </div>
              <!-- Combine check box-->
              <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" v-model="options.metadata" id="combine">
                <label class="custom-control-label" for="combine">Combine clips into one album</label>
              </div>
              <!-- Album -->
              <div class="form-group" v-if="options.metadata">
                <label for="Album">Album Name</label>
                <input type="text" class="form-control" id="album" v-model="options.album" placeholder="album name">
              </div>
              <div class="text-center" >
              <label for="full">Split into smaller Clips:</label>
              </div>
              <div class="row">
                <!-- Radio select full-->
                <div class="col custom-control custom-radio text-center">
                  <input type="radio" class="custom-control-input" value="full" v-model="options.split" id="full" name="split">
                  <label class="custom-control-label" for="full">Full</label>
                </div>
                <!-- Radio select split-->
                <div class="col custom-control custom-radio text-center">
                  <input type="radio" class="custom-control-input" value="split" v-model="options.split" id="split"
                    name="split" checked>
                  <label class="custom-control-label" for="split">Split</label>
                </div>
              </div>
              <!-- Duration -->
              <div class="form-group col text-center" v-if="options.split=='split'">
                <label for="duration">Duration</label>
                <input type="text" class="form-control" id="duration" v-model="options.duration" placeholder="mm:ss">
              </div>
              <div class="form-row text-center">
                <!-- Start -->
                <div class="form-group col">
                  <label for="start">Cut from start:</label>
                  <input type="text" class="form-control" id="startAt" v-model="options.startAt" placeholder="mm:ss">
                </div>
                <!-- End -->
                <div class="form-group col">
                  <label for="end">Cut from end:</label>
                  <input type="text" class="form-control" id="endAt" v-model="options.endAt" placeholder="mm:ss">
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-primary btn-block" @click="saveDefault"> Save as default
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!--Output select-->
    <div class="fixed-bottom">
      <div class="input-group">
        <div class="form-group col filePath">
          <input type="text" class="form-control" id="endAt" v-model="outputPath" placeholder="please select a folder">
        </div>
        <div class="btn btn-primary file-btn">
          <span>select folder</span>
          <input type="file" class="file-input" webkitdirectory directory @change="outputFolder" />
        </div>
      </div>
      <button :disabled="outputPath==null||outputPath==''" type="button" class="convertButton btn btn-primary btn-block"
        @click="start">
        {{download ? "Start downloading & converting":"Start converting" }}</button>
    </div>
    <v-dialog />

    <!-- progression modal -->
    <modal name="progress" height="auto" :clickToClose="false" :adaptive="true">
      <div class="box">
        <h4>{{download ? "Downloading...":"Converting..."}}</h4>
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0"
            :style="{ 'width': ((100/episodes.length)*progress.progress)+'%' }" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        {{progress.info}}
      </div>
    </modal>
  </div>
</template>

<script>
  import Video from '@/services/videos'
  import Download from '@/services/download'
  import Split from '@/services/split'

  const Store = require('electron-store')
  const path = require('upath')
  const store = new Store()
  export default {
    name: 'download',
    data () {
      return {
        secondsToTimeString: Split.secondsToTimeString,
        download: false,
        episodes: [],
        averageDuration: 0,
        outputPath: '',
        progress: {
          progress: 0,
          info: ''
        },
        options: {
          startAt: '00:00',
          endAt: '00:00',
          duration: '3:00',
          split: 'split',
          metadata: false,
          cover: false,
          rename: false,
          full: false,
          album: '',
          outputFolder: 'audio'
        }
      }
    },
    mounted () {
      this.getDefault()
      if (Download.get().length) {
        this.download = true
        this.episodes = Download.get()
      } else {
        this.episodes = Video.get()
        this.outputPath = path.dirname(this.episodes[0].path)
      }
      // set album name
      this.options.album = this.episodes[0].name.replace(/(\s*-*\s*\d+\s*)+/g, '')
      this.getAverageDuration()
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        if (!Video.get().length && !Download.get().length) {
          vm.$router.push('landing-page')
        }
      })
    },
    components: {},
    methods: {
      start () {
        this.$modal.show('progress')
        if (this.download) {
          Download.download(this.outputPath, this.progress).then(
            downloadedFiles => {
              this.download = false
              this.progress.progress = 0
              this.progress.info = 'start converting'

              this.startSplitting(downloadedFiles)
            }
          )
        } else {
          this.startSplitting(this.episodes)
        }
      },
      folderExists () {
        this.$modal.show('dialog', {
          title: 'output folder audio already exist',
          text: '',
          buttons: [{
            title: 'replace folder',
            handler: () => {
              alert('Woot!')
            }
          },
          {
            title: 'use existing folder', // Button title
            default: true, // Will be triggered by default if 'Enter' pressed.
            handler: () => {} // Button click handler
          },
          {
            title: 'Close'
          }
          ]
        })
      },

      startSplitting (files) {
        this.options.full = this.options.split === 'full'
        Split.split(files, this.options, this.outputPath, this.progress).then(clips => {
          this.$router.push('finish')
        })
      },
      // preview rename
      renamePreview (name) {
        let removeRound = name.replace(/ *\([^)]*\) */g, '')
        let removeSquare = removeRound.replace(/ *\[[^)]*\] */g, '')
        let removeSwift = removeSquare.replace(/ *\{[^)]*\} */g, '')
        let removeRaw = removeSwift.replace(' RAW', '')
        name = removeRaw
        return name.trim()
      },
      saveDefault () {
        store.set('options', this.options)

        let toast = this.$toasted.success('Saved', {
          theme: 'outline',
          position: 'bottom-center',
          duration: 1000
        })
      },
      getDefault () {
        let options = store.get('options')
        if (options) {
          this.options = options
        }
      },
      getAverageDuration () {
        let total = 0
        for (const ep of this.episodes) {
          if (ep.duration) {
            total += Number(ep.duration)
          }
        }
        this.averageDuration = Split.secondsToTimeString(total / this.episodes.length)
      },
      outputFolder (e) {
        this.outputPath = e.target.files[0].path
      }
    }
  }
</script>

<style>
  .listOverflow {
    overflow-y: auto;
    height: 450px;
  }

  .file-btn {
    position: relative;
    margin-bottom: 11px
  }

  .file-btn input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  .box {
    text-align: center
  }

  .list-group-item {
    padding: 3px 10px
  }

  .card-right {
    margin-top: 10px;
    margin-right: 10px;
    
  }

  .card-left {
    margin-top: 10px;
    margin-left: 10px;
  }

  .fileSelect {
    margin-top: 0px
  }

  .filePath {
    margin-top: 11px
  }
  .video-col{
    padding-right: 0px
  }
  .list {
    background: #fff;
    border-radius: 3px;
    border: 1px solid #ddd;
    -webkit-overflow-scrolling: touch;
  }
</style>