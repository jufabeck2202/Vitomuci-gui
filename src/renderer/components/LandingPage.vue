<template>
  <div id="wrapper">
    <main>
      <div class="row">
        <div class="col">
          Download Youtube Playlist or Podcast from Rss feed
          <input type="text" v-model="url" class="form-control" placeholder="youtube url or podcast rss feed" />
          <button type="button" class="btn btn-primary" v-on:click="searchUrl">Download</button>
        </div>
        <div class="col">
          <div class="icon-choose-image btn btn-primary file-btn animated fadeIn">
            <i class="fa fa-upload pr-2" aria-hidden="true"></i>
            <span> Choose file(s)…</span>
            <input class="file-input" multiple type="file" name="resume" @change="handleFileChange" />
          </div>
          <div class="icon-choose-image btn btn-primary file-btn animated fadeIn">
            <i class="fa fa-upload pr-2" aria-hidden="true"></i>
            <span> Choose folder…</span>
            <input class="file-input" type="file" name="resume" webkitdirectory directory @change="handleFileChange" />
          </div>
          <file-dropdown v-bind:dropFiles="verifyFiles"></file-dropdown>

        </div>
      </div>
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
        let toast = this.$toasted.success('Scanning Url...', {
          theme: 'outline',
          position: 'bottom-center',
          duration: 1000
        })
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

  .strike {
    display: block;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
  }

  .strike>span {
    position: relative;
    display: inline-block;
  }

  .strike>span:before,
  .strike>span:after {
    content: "";
    position: absolute;
    top: 50%;
    width: 9999px;
    height: 1px;
    background: gray;
  }

  .strike>span:before {
    right: 100%;
    margin-right: 15px;
  }

  .strike>span:after {
    left: 100%;
    margin-left: 15px;
  }
</style>