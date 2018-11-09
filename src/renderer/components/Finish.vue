<template>
  <div id="wrapper">
      <div class="box">
        <h4>Finished</h4>
        <p>created {{clips.length}} clips</p>
      </div>
      <button type="button" class="btn btn-primary btn-block" @click="open">Open Folder</button>
      <button type="button" class="btn btn-primary btn-block" @click="close">Close</button>
  </div>
</template>

<script>
import Split from '@/services/split'
const path = require('upath')
const { shell } = require('electron')

export default {
  name: 'finish',
  data () {
    return {
      clips: []
    }
  },
  mounted () {
    this.clips = Split.getConvertedClips()
    console.log(this.clips)
  },
  methods: {
    close () {
      this.$router.push('landing-page')
    },
    open () {
      shell.openItem(path.dirname(this.clips[0].path))
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