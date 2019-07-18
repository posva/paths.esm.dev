<template>
  <div
    class="py-1 rounded"
    :class="active && 'bg-blue-100'"
    :aria-selected="active"
  >
    <input
      v-model="path.path"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      class="block bg-white focus:outline-0 focus:shadow-outline border border-gray-300
    rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
      type="text"
      placeholder="/users/:id"
    />
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
        <input
          v-model="path.options.strict"
          class="leading-tight"
          type="checkbox"
        />
        Strict
      </label>

      <label class="text-sm">
        <input
          v-model="path.options.sensitive"
          class="leading-tight"
          type="checkbox"
        />
        Case sensitive
      </label>
    </fieldset>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    path: Object,
    active: Boolean,
  },
})
export default class PathEntry extends Vue {}
</script>

<style scoped></style>
