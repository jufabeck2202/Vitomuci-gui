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
      <div><file-dropdown></file-dropdown></div>
      
    </main>
  </div>
</template>

<script>
  import FileDropdown from './LandingPage/FileDropdown'
  import vito from '@/services/videos'

  export default {
    name: 'landing-page',
    components: {
      FileDropdown

    },
    methods: {
      handleFileChange(e) {
        // Whenever the file changes, emit the 'input' event with the file data.
        vito.getFiles(e.target.files);
      }
    }
  }
</script>

<style>
  
</style>