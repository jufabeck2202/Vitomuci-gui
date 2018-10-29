<template>
  <div id="wrapper">
       <div class="box">
        <h4>Finished</h4>
        <p>created {{clips.length}} clips</p>
        </div>
  </div>
</template>

<script>
import Split from "@/services/split";
const path = require("upath");
export default {
  name: "finish",
  data() {
    return {
      clips: []
    };
  },
  mounted() {
    this.clips = Split.getConvertedClips()
    console.log(this.clips);
  },
  methods: {}
};
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