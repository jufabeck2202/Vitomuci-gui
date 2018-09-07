<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <div class="container">
      <div class="row">
        <div class="col overflow">
          <div v-for="(video) in videos" :key="video.xxx">
            <li>{{video.name}}</li>
          </div>
        </div>
        <div class="col">
          <!--Card Primary-->
          <div class="card indigo text-center z-depth-2">
            <div class="card-body">
              <h3 class="text-uppercase font-weight-bold amber-text mt-2 mb-3"><strong>News title</strong><i class="fa fa-heart-o ml-3"></i></h3>
              <p class="white-text mb-0">Ut enim ad minima veniam, quis nostrum exercita tionem ullam corporis suscipit
                laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea
                voluptate non proident velit esse quam. </p>
            </div>
          </div>
          <!--/.Card Primary-->
        </div>
      </div>
    </div>


  </div>
</template>

<script>
  import Video from '@/services/videos'

  export default {
    name: 'download',
    data() {
      return {
        videos: Video.get()
      }
    },
    mounted() {

    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        if (!Video.get().length) {
          vm.$router.push('landing-page')
        }
      })
    },
    components: {},
    methods: {
      download() {
        Download.download(this.output, this.downloadUpdate).then(episodes => {})
      },
      downloadUpdate(progress) {
        this.downloadProgress = progress
      }
    }
  }
</script>

<style>
.overflow{
  overflow: scroll;
    height: 300px;
}
</style>