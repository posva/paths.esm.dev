<template>
  <section
    tabindex="0"
    class="px-2 py-1 overflow-auto border-2 rounded"
    :class="classes"
    :aria-multiselectable="isMatching"
  >
    <h2>
      <span
        :class="isError ? 'bg-red-400' : 'bg-gray-400'"
        class="inline-block px-1 mr-2 font-bold rounded"
        >{{ isError ? matcher.name : formattedScore }}</span
      >
      <span class="font-mono">{{ matcher.record.path }}</span>
    </h2>
    <h3>
      <template v-if="isError">
        {{ matcher.message.replace(/^err[^:]*:\s*/i, '') }}
      </template>
      <template v-else>
        Regexp: <span class="font-mono">{{ matcher.re.toString() }}</span>
      </template>
    </h3>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { RouteRecordMatcher, RouteRecordMatcherError } from '../types/matcher'

export default defineComponent({
  props: {
    matcher: [Object, Error] as PropType<
      RouteRecordMatcher | RouteRecordMatcherError
    >,
    active: Boolean,
    currentLocation: String,
  },

  setup(props) {
    const isError = computed(() => props.matcher instanceof Error)
    const isMatching = computed(
      () =>
        !isError.value &&
        (props.matcher as RouteRecordMatcher).re.test(props.currentLocation)
    )
    const formattedScore = computed(() =>
      (props.matcher as RouteRecordMatcher).score
        .map((score) => score.join(', '))
        .join(' | ')
    )
    const classes = computed(() =>
      isError.value
        ? 'border-red-300 bg-red-100 hover:bg-red-200'
        : {
            'hover:bg-gray-200 ': true,
            'border-blue-300': !isMatching.value,
            'border-green-300': isMatching.value,
            'bg-green-100': isMatching.value,
            // @ts-ignore
            'bg-gray-200': !isMatching.value && props.active,
          }
    )

    return { isError, isMatching, classes, formattedScore }
  },
})
</script>
