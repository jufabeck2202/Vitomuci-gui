<template>
  <div id="app">
    <router-view>
    </router-view>
  </div>
</template>

<script>
  export default {
    name: 'elvue',
    mounted () {
      this.$nextTick(() => {
        this.$el.addEventListener('drop', event => {
          event.preventDefault()
        })
        this.$el.addEventListener('dragover', event => {
          event.preventDefault()
        })
      })
    },
  }
</script>

<style>
  /* CSS */
</style>
