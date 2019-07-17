<template>
  <section v-if="!isError">
    <h2>
      <span class="font-bold bg-gray-400 px-1 inline-block rounded">{{
        matcher.score
      }}</span>
      <span class="font-mono">{{ matcher.path }}</span>
    </h2>
    <h3>
      Regexp: <span class="font-mono">{{ matcher.re.toString() }}</span>
    </h3>
  </section>
  <section v-else>
    <h2>{{ matcher.name }}</h2>
    <h3>{{ matcher.message }}</h3>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    matcher: Object,
  },
})
export default class RouteMatcher extends Vue {
  get isError() {
    // @ts-ignore
    return this.matcher instanceof Error
  }
}
</script>

<style scoped>
</style>
