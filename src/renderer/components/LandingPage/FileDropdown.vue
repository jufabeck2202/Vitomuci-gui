<template>
  <div>
    <div id="dropzone">
      <div>drag and drop video files...</div>
      <input type="file" multiple />
    </div>
  </div>
</template>

<script>
  export default {
    mounted () {
      this.$nextTick(() => {
        this.$el.addEventListener('drop', this.onDrop)
        this.$el.addEventListener('dragover', this.onDragover)
        this.$el.addEventListener('dragleave', this.onDragleave)
      })
    },
    beforeDestroy () {
      this.$el.removeEventListener('drop', this.onDrop)
      this.$el.removeEventListener('dragover', this.onDragover)
      this.$el.removeEventListener('dragleave', this.onDragleave)
    },
    props: {
      dropFiles: Function
    },
    methods: {
      onDrop (e) {
        const files = e.dataTransfer.files
        this.dropFiles(files)
      },
      onDragover () {
        this.dragging = true
      },
      onDragleave () {
        this.dragging = false
      }
    }
  }
</script>

<style scoped>
  body {
    background: #333;
  }

  #dropzone {
    position: relative;
    border: 4px solid black;
    border-radius: 1px;
    color: black;
    font: bold 24px/260px arial;
    height: 300px;
    margin: 10px;
    text-align: center;
    width: auto;
  }

  #dropzone.hover {
    border: 10px solid #FE5;
    color: #FE5;
  }

  #dropzone.dropped {
    background: #222;
    border: 10px solid #444;
  }

  #dropzone div {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  #dropzone img {
    border-radius: 10px;
    vertical-align: middle;
    max-width: 95%;
    max-height: 95%;
  }

  #dropzone [type="file"] {
    cursor: pointer;
    position: absolute;
    opacity: 0;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
</style>