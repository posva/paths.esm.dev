<template>
  <div
    class="py-1 rounded"
    :class="active && 'bg-blue-100'"
    :aria-selected="active"
  >
    <label>
      <span class="sr-only">Path to rank</span>
      <input
        v-model="path.path"
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
        class="block w-full px-4 py-2 leading-normal bg-white border border-gray-300 rounded-lg appearance-none focus:outline-0 focus:shadow-outline"
        type="text"
        placeholder="/users/:id"
        ref="input"
        @keypress.enter="$emit('enter')"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      />
    </label>
    <fieldset
      v-if="path.path"
      class="pb-2 pl-4 pr-1 border"
      :disabled="!path.applyOptions"
    >
      <legend class="p-2">
        <label class="block text-md">
          <input
            v-model="path.applyOptions"
            class="leading-tight"
            type="checkbox"
          />
          Options override
        </label>
      </legend>

      <label class="text-sm">
        <input v-model="path.strict" class="leading-tight" type="checkbox" />
        Strict
      </label>

      <label class="text-sm">
        <input v-model="path.sensitive" class="leading-tight" type="checkbox" />
        Case sensitive
      </label>
    </fieldset>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'
import { PathToRank } from '../types/matcher'

export default defineComponent({
  props: {
    path: Object as PropType<PathToRank>,
    active: Boolean,
  },

  setup(props, { emit }) {
    const input = ref()
    watch(
      () => props.path!.path,
      (path) => {
        // if the user is navigating while the input is focused, we emit focus to
        // update the active route
        if (document.activeElement === input.value) emit('focus')
      }
    )

    return { input }
  },
})
</script>
