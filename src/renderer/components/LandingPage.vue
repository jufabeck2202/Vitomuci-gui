<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <main>
      <div class="file">
        <label class="file-label">
          <input class="file-input" multiple type="file" name="resume" @change="handleFileChange">
          <span class="file-cta">
            <span class="file-icon">
              <i class="fas fa-upload"></i>
            </span>
            <span class="file-label">
              Choose a file(s)…
            </span>
          </span>
        </label>
      </div>
      <div class="file">
        <label class="file-label">
          <input class="file-input" type="file" name="resume" webkitdirectory directory @change="handleFileChange">
          <span class="file-cta">
            <span class="file-icon">
              <i class="fas fa-upload"></i>
            </span>
            <span class="file-label">
              Choose a folder…
            </span>
          </span>
        </label>
      </div>
      <label for="defaultFormLoginEmailEx" class="grey-text">Youtube or Podcast Rss url</label>
      <input type="text" v-model="url" class="form-control" placeholder="url..." />
      <button type="button" class="btn btn-primary" v-on:click="searchUrl">Primary</button>

      <br>
      <file-dropdown v-bind:dropFiles="verifyFiles"></file-dropdown>
    </main>
  </div>
</template>

<script>
  import FileDropdown from './LandingPage/FileDropdown'
  import Videos from '@/services/videos'
  import Url from '@/services/url'
  import Download from '@/services/download'
  const path = require('upath')

  export default {
    name: 'landing-page',
    data() {
      return {
        url: 'https://collegeinfogeek.com/podcast'
      }
    },
    components: {
      FileDropdown
    },
    methods: {
      searchUrl() {
        Url.getContent(this.url).then(episodes => {
          if (episodes === undefined || episodes.length === 0) {
            new Notification('Wrong url format', {
              body: 'Please, insert youtube or podcast url',
              // TODO: fix icon path
              icon: path.join(__dirname, '/dist/imgs/logo--assets.png')
            })
            return
          }
          // switch to download screen
          Download.set(episodes)
          this.$router.push('download')
        })
      },
      handleFileChange(e) {
        // Whenever the file changes, emit the 'input' event with the file data.
        this.verifyFiles(e.target.files)
      },
      verifyFiles(files) {
        let verifiedFiles = Videos.verifyFiles(Videos.getFiles(files))

        if (!verifiedFiles.length) {
          new Notification('Wrong format', {
            body: 'Please, drop a video(s)',
            // TODO: fix icon path
            icon: path.join(__dirname, '/dist/imgs/logo--assets.png')
          })
          return
        }
        Videos.set(verifiedFiles)
        this.$router.push('videos')
      }
    }
  }
</script>

<style>

</style>