<template>
  <div id="wrapper">
    <div class="row">

      <div class="col">
        <h3>Found {{episodes.length}} files</h3>
        <h5>Select files to download</h5>
      </div>
      <div class="col">
        <button type="button" class="btn btn-primary btn-sm float-right select-all" @click="setChecked">select all</button>

      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <virtual-list :size="10" :remain="39" :bench="20" wtag="ul">
          <li class="list-group-item list" v-for="(episode,i) in episodes" :key="i">
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" v-bind:id="i" v-model="episode.checked">
              <label class="custom-control-label episode-name" v-bind:for="i">{{episode.name}}</label>
              <span class="float-right">{{secondsToTimeString(episode.duration)}}</span>
            </div>
          </li>
        </virtual-list>
      </div>
    </div>
    <button :disabled="episodes.filter(function(e){return e.checked}).length<1" type="button" class="btn btn-primary btn-block fixed-bottom"
      @click="confirm">Confirm</button>

  </div>
</template>

<script>
  import Download from '@/services/download'
  import Split from '@/services/split'

  export default {
    name: 'download',
    data () {
      return {
        episodes: [],
        secondsToTimeString: Split.secondsToTimeString

      }
    },
    mounted () {
      let episodes = Download.get()
      episodes.forEach(e => {
        e.checked = false
      })
      this.episodes = episodes
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        if (!Download.get().length) {
          vm.$router.push('landing-page')
        }
      })
    },
    components: {},
    methods: {
      confirm () {
        let selectedEpisodes = []
        for (const episode of this.episodes) {
          if (episode.checked) {
            selectedEpisodes.push(episode)
          }
        }
        Download.set(selectedEpisodes)
        this.$router.push('videos')
      },
      setChecked () {
        for (const episode of this.episodes) {
          episode.checked = true
        }
      }
    }
  }
</script>

<style>
  ul {
    background: #fff;
    border-radius: 3px;
    border: 1px solid #ddd;
    -webkit-overflow-scrolling: touch;
    
  }

  .card {
    margin-left: 10px;
    margin-right: 10px
  }
  .select-all{
    margin-top:30px
  }
  .episode-name{
    max-width: 400px;
  }
</style>