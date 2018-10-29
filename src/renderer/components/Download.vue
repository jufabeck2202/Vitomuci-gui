<template>
  <div id="wrapper">
    <div>
      <h3>Found {{episodes.length}} files</h3>
      <h5>Select files to download</h5>
    </div>

    <div class="overflow">
      <ul class="list-group listOverflow">
        <li class="list-group-item" v-for="(episode,i) in episodes" :key="episode.xxx">
          <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" v-bind:id="i" v-model="episode.checked">
            <label class="custom-control-label" v-bind:for="i">{{episode.name}}</label>
            <span class="float-right">{{secondsToTimeString(episode.duration)}}</span>
          </div>
        </li>
      </ul>
    </div>
    <button type="button" class="btn btn-primary btn-block bottomB" @click="confirm">Confirm</button>

  </div>
</template>

<script>
  import Download from '@/services/download'
  import Split from '@/services/split'
  const path = require('upath')

  export default {
    name: 'download',
    data() {
      return {
        episodes: [],
        secondsToTimeString: Split.secondsToTimeString

      }
    },
    mounted() {
      this.setChecked()
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        if (!Download.get().length) {
          vm.$router.push('landing-page')
        }
      })
    },
    components: {},
    methods: {
      confirm() {
        let selectedEpisodes = []
        for (const episode of this.episodes) {
          if (episode.checked) {
            selectedEpisodes.push(episode)
          }
        }
        Download.set(selectedEpisodes)
        this.$router.push('videos')
      },
      setChecked() {
        let episodes = Download.get()
        for (const episode of episodes) {
          episode.checked = true
        }
        this.episodes = episodes
      }
    }
  }
</script>

<style>
  .overflow {
    overflow: scroll;
    height: 300px;
  }

  .listOverflow {
    overflow-y: auto;
    height: 450px;
  }

  .bottomB {
    position: fixed;
    bottom: 0px;
  }
</style>