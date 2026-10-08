<template>
  <section
    tabindex="0"
    class="px-2 py-1 overflow-auto border-2 rounded"
    :class="classes"
    :aria-multiselectable="isMatching"
  >
    <h2>
      <span
        :class="errorMatcher ? 'bg-red-400' : 'bg-gray-400'"
        class="inline-block px-1 mr-2 font-bold rounded"
        >{{ errorMatcher ? errorMatcher.name : formattedScore }}</span
      >
      <span class="font-mono">{{ matcher.record.path }}</span>
    </h2>
    <h3>
      <template v-if="errorMatcher">
        {{ errorMatcher.message.replace(/^err[^:]*:\s*/i, '') }}
      </template>
      <template v-else-if="validMatcher">
        Regexp: <span class="font-mono">{{ validMatcher.re.toString() }}</span>
      </template>
    </h3>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { RouteRecordMatcher, RouteRecordMatcherError } from '../types/matcher'

export default defineComponent({
  props: {
    matcher: {
      type: [Object, Error] as PropType<
        RouteRecordMatcher | RouteRecordMatcherError
      >,
      required: true,
    },
    active: Boolean,
    currentLocation: String,
  },

  setup(props) {
    const errorMatcher = computed(() =>
      props.matcher instanceof Error ? props.matcher : null
    )
    const validMatcher = computed(() =>
      props.matcher instanceof Error ? null : props.matcher
    )
    const isMatching = computed(
      () =>
        !!props.currentLocation &&
        !!validMatcher.value?.re.test(props.currentLocation)
    )
    const formattedScore = computed(() =>
      validMatcher.value?.score.map((score) => score.join(', ')).join(' | ')
    )
    const classes = computed(() =>
      errorMatcher.value
        ? 'border-red-300 bg-red-100 hover:bg-red-200'
        : {
            'hover:bg-gray-200 ': true,
            'border-blue-300': !isMatching.value,
            'border-green-300': isMatching.value,
            'bg-green-100': isMatching.value,
            'bg-gray-200': !isMatching.value && props.active,
          }
    )

    return { errorMatcher, validMatcher, isMatching, classes, formattedScore }
  },
})
</script>
