<template>
  <div class="py-1">
    <input
      v-model="path.path"
      class="bg-white focus:outline-0 focus:shadow-outline border border-gray-300
    rounded-lg py-2 px-4 block w-full appearance-none leading-normal max-w-xs"
      type="text"
      placeholder="/users/:id"
    />
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
