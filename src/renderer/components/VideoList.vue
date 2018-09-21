<template>
  <div>
    <div class="container">
      <div class="row">
        <div class="col overflow">
          <div v-for="(episode) in episodes" :key="episode.xxx">
            <p>{{options.rename?renamePreview(episode.name):episode.name}}</p>
          </div>
        </div>
        <div class="col">
          <!-- Default form login -->
          <form class="text-center">
            <p>{{averageDuration}} min average duration </p>
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
            <!-- Radio select full-->
            <div class="custom-control custom-radio">
              <input type="radio" class="custom-control-input" value="full" v-model="options.split" id="full" name="split">
              <label class="custom-control-label" for="full">Full</label>
            </div>
            <!-- Radio select split-->
            <div class="custom-control custom-radio">
              <input type="radio" class="custom-control-input" value="split" v-model="options.split" id="split" name="split"
                checked>
              <label class="custom-control-label" for="split">Split</label>
            </div>
            <!-- Duration -->
            <div class="form-group col" v-if="options.split=='split'">
              <label for="duration">Duration</label>
              <input type="text" class="form-control" id="duration" v-model="options.duration" placeholder="mm:ss">
            </div>
            <div class="form-row">
              <!-- Start -->
              <div class="form-group col">
                <label for="start">Start at:</label>
                <input type="text" class="form-control" id="startAt" v-model="options.startAt" placeholder="mm:ss">
              </div>
              <!-- End -->
              <div class="form-group col">
                <label for="end">End at:</label>
                <input type="text" class="form-control" id="endAt" v-model="options.endAt" placeholder="mm:ss">
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-primary btn-block" @click="saveDefault"> Save as default
            </button>
          </form>
        </div>
      </div>
    </div>
    <input type="file" class="form-control" webkitdirectory directory @change="outputFolder">

    <button :disabled="output==null" type="button" class="btn btn-primary btn-block" @click="start">
      {{download ? "Start downloading & converting":"Start converting" }}</button>
  </div>
</template>∏

<script>
  import Video from '@/services/videos'
  import Download from '@/services/download'
  import Split from '@/services/split'

  const Store = require('electron-store')
  const store = new Store()

  export default {
    name: 'download',
    data () {
      return {
        download: false,
        episodes: [],
        output: null,
        averageDuration: 0,
        options: {
          startAt: '00:00',
          endAt: '00:00',
          duration: '3:00',
          split: 'split',
          metadata: false,
          cover: false,
          rename: false,
          full: false,
          name: '',
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
      }

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
        if (this.download) {
          Download.download(this.output, this.downloadUpdate).then(
            downloadedFiles => {
              this.startSplitting(downloadedFiles)
            }
          )
        } else {
          this.startSplitting(this.episodes)
        }
      },
      startSplitting (downloadedFiles) {
        Split.checkffmpeg()
        this.options.full = this.options.split === 'full'
        Split.split(this.output, downloadedFiles, this.options).then(clips => {
          console.log(clips)
        })
      },
      // preview rename
      renamePreview (name) {
        let removeRound = name.replace(/ *\([^)]*\) */g, '')
        let removeSquare = removeRound.replace(/ *\[[^)]*\] */g, '')
        let removeSwift = removeSquare.replace(/ *\{[^)]*\} */g, '')
        let removeRaw = removeSwift.replace(" RAW","");
        name = removeRaw
        return name.trim(); 
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
        console.log(this.episodes)
        for (const ep of this.episodes) {
          total += Number(ep.duration)
        }
        this.averageDuration = Split.secondsToTimeString(total / this.episodes.length)
      },
      outputFolder (e) {
        this.output = e.target.files[0].path
      },
      downloadUpdate (progress) {
        console.log(progress)
      }
    }
  }
</script>

<style>
  .overflow {
    overflow: scroll;
    height: 300px;
  }
</style>