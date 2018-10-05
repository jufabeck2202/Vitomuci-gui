<template>
  <div id="wrapper">
    <div class="overflow">
      <ul class="list-group listOverflow">
        <li class="list-group-item" v-for="(episode) in episodes" :key="episode.xxx">{{episode.name}}<span
            class="float-right">{{secondsToTimeString(episode.duration)}}</span></li>
      </ul>
      <div v-for="(episode,i) in episodes" :key="episode.xxx">
        <div class="custom-control custom-checkbox">
          <input type="checkbox" class="custom-control-input" v-bind:id="i" v-model="episode.checked">
          <label class="custom-control-label" v-bind:for="i">{{episode.name}}</label>
        </div>
      </div>
    </div>
    <button type="button" class="btn btn-primary btn-block" @click="confirm">Confirm</button>

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
        episodes: '',
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
</style>