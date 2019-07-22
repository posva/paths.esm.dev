<template>
  <section
    v-if="!isError"
    tabindex="0"
    class="rounded border-2 px-2 py-1 hover:bg-gray-200 overflow-auto"
    :class="classes"
    :aria-multiselectable="isMatching"
  >
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
  <section v-else :class="classes">
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
    active: Boolean,
    currentLocation: String,
  },
})
export default class RouteMatcher extends Vue {
  get isError() {
    // @ts-ignore
    return this.matcher instanceof Error
  }

  get isMatching() {
    // @ts-ignore
    return !this.isError && this.matcher.re.test(this.currentLocation)
  }

  get classes() {
    return {
      'border-blue-300': !this.isMatching,
      'border-green-300': this.isMatching,
      'bg-green-100': this.isMatching,
      // @ts-ignore
      'bg-gray-200': !this.isMatching && this.active,
    }
  }
}
</script>

<style scoped></style>
