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
      <span class="font-mono">{{ matcher.record.path }}</span>
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
import { defineComponent, PropType, computed } from 'vue'
import { createRouterMatcher } from 'vue-router'

type RouteRecordMatcher = ReturnType<
  ReturnType<typeof createRouterMatcher>['getRecordMatcher']
>

export default defineComponent({
  props: {
    matcher: Object as PropType<RouteRecordMatcher>,
    active: Boolean,
    currentLocation: String,
  },

  setup(props) {
    const isError = computed(() => props.matcher instanceof Error)
    const isMatching = computed(
      () => !isError.value && props.matcher.re.test(props.currentLocation)
    )
    const classes = computed(() => ({
      'border-blue-300': !isMatching.value,
      'border-green-300': isMatching.value,
      'bg-green-100': isMatching.value,
      // @ts-ignore
      'bg-gray-200': !isMatching.value && props.active,
    }))

    return { isError, isMatching, classes }
  },
})
</script>
