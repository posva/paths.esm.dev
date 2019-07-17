<template>
  <div>
    <input v-model="path.path" type="text" placeholder="/users/:id" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    path: Object,
  },
})
export default class PathEntry extends Vue {}
</script>

<style scoped>
</style>
