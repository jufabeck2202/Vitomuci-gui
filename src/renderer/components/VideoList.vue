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
          <!-- Default form login -->
          <form class="text-center">
            <!-- Create cover checkbox-->
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="cover">
              <label class="custom-control-label" for="cover">Create Cover</label>
            </div>
            <!-- rename ceckbox-->
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="rename">
              <label class="custom-control-label" for="rename">Rename file, remove {}()[]</label>
            </div>
            <!-- Combine check box-->
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="combine">
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
            <div class="form-group col">
              <label for="duration">Duration</label>
              <input type="text" class="form-control" id="duration" v-model="options.duration" placeholder="mm:ss">
            </div>
            <div class="form-row" v-if="options.split=='split'">
              <!-- Start -->
              <div class="form-group col">
                <label for="start">Start</label>
                <input type="text" class="form-control" id="start" v-model="options.start" placeholder="mm:ss">
              </div>
              <!-- End -->
              <div class="form-group col">
                <label for="end">End</label>
                <input type="text" class="form-control" id="end" v-model="options.end" placeholder="mm:ss">
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <button type="button" class="btn btn-primary btn-block" @click="start">Start Converting</button>
  </div>
</template>

<script>
  import Video from '@/services/videos'

  export default {
    name: 'download',
    data() {
      return {
        videos: Video.get(),
        options: {
          start: "2:30",
          end: "20:00",
          duration: "3:00",
          split: "split"
        }
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
      start() {
        console.log(this.options);
      },
      download() {},
      downloadUpdate(progress) {}
    }
  }
</script>

<style>
  .overflow {
    overflow: scroll;
    height: 300px;
  }
</style>