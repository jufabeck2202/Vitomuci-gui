<template>
    <div id="wrapper">
        <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
        <main>
            <div v-for="(episode,i) in episodes" :key="episode.xxx">
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" v-bind:id="i" checked>
                    <label class="custom-control-label" v-bind:for="i">{{episode.title}}</label>
                </div>
            </div>
            <input type="file" class="form-control" webkitdirectory directory @change="outputFolder">

            <label for="defaultFormLoginEmailEx" class="grey-text">Youtube or Podcast Rss url</label>
            <input type="text" v-model="output" class="form-control" placeholder="url..." />
            <button type="button" class="btn btn-primary" v-on:click="download">Download</button>

        </main>
    </div>
</template>

<script>
    import Download from "@/services/download"
    const path = require('upath')

    export default {
        name: 'download',
        data() {
            return {
                episodes: Download.get(),
                output: "",
                downloadProgress: 0
            }
        },
        mounted() {

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
            outputFolder(e) {
                this.output = e.target.files[0].path;
            },
            download() {
                Download.download(this.output, this.downloadUpdate).then(episodes => {})
            },
            downloadUpdate(progress) {
                console.log(progress)
                this.downloadProgress = progress
            }
        }
    }
</script>

<style>
</style>