<template>
  <div id="wrapper">
    <main>
      <div class="icon-choose-image btn btn-primary file-btn animated fadeIn">
        <i class="fa fa-upload pr-2" aria-hidden="true"></i>
        <span> Choose a file(s)…</span>
        <input class="file-input" multiple type="file" name="resume" @change="handleFileChange" />
      </div>
      <div class="icon-choose-image btn btn-primary file-btn animated fadeIn">
        <i class="fa fa-upload pr-2" aria-hidden="true"></i>
        <span> Choose a folder…</span>
        <input class="file-input" type="file" name="resume" webkitdirectory directory @change="handleFileChange"/>
      </div>
      <br>
      <label for="defaultFormLoginEmailEx" class="grey-text">Youtube or Podcast Rss url</label>
      <input type="text" v-model="url" class="form-control" placeholder="url..." />
      <button type="button" class="btn btn-primary" v-on:click="searchUrl">Primary</button>
      <br>
      <file-dropdown v-bind:dropFiles="verifyFiles"></file-dropdown>
    </main>
  </div>
</template>

<script>
  import FileDropdown from "./LandingPage/FileDropdown";
  import Videos from "@/services/videos";
  import Url from "@/services/url";
  import Download from "@/services/download";
  const path = require("upath");

  export default {
    name: "landing-page",
    data() {
      return {
        url: "https://www.youtube.com/playlist?list=PLfpHPxe91z9NEwLMsxfmAehlZnoTzRFB8"
      };
    },
    components: {
      FileDropdown
    },
    methods: {
      searchUrl() {
        Url.getContent(this.url).then(episodes => {
          if (episodes === undefined || episodes.length === 0) {
            new Notification("Wrong url format", {
              body: "Please, insert youtube or podcast url",
              // TODO: fix icon path
              icon: path.join(__dirname, "/dist/imgs/logo--assets.png")
            });
            return;
          }
          // switch to download screen
          Download.set(episodes);
          this.$router.push("download");
        });
      },
      handleFileChange(e) {
        // Whenever the file changes, emit the 'input' event with the file data.
        this.verifyFiles(e.target.files);
      },
      verifyFiles(files) {
        let verifiedFiles = Videos.verifyFiles(Videos.getFiles(files));

        if (!verifiedFiles.length) {
          new Notification("Wrong format", {
            body: "Please, drop a video(s)",
            // TODO: fix icon path
            icon: path.join(__dirname, "/dist/imgs/logo--assets.png")
          });
          return;
        }
        Videos.set(verifiedFiles);
        this.$router.push("videos");
      }
    }
  };
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
</style>