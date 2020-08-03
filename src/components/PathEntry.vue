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
        class="block bg-white focus:outline-0 focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
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
      class="border pl-4 pr-1 pb-2"
      :disabled="!path.applyOptions"
    >
      <legend class="p-2">
        <label class="text-md block">
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
import { defineComponent, PropType } from 'vue'
import { PathToRank } from '../api/encode-data'

export default defineComponent({
  props: {
    path: Object as PropType<PathToRank>,
    active: Boolean,
  },
  mounted() {
    this.$watch('path.path', (path) => {
      // if the user is navigating while the input is focused, we emit focus to
      // update the active route
      if (document.activeElement === this.$refs.input) this.$emit('focus')
    })
  },
})
</script>
