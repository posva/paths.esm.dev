<template>
  <div class="container">
    <div>
      <h1 class="title">path-ranker</h1>
      <h2 class="subtitle">A vue router path ranker tester</h2>
      <form @submit.prevent>
        <fieldset>
          <label for="options.strict">
            <input
              id="options.strict"
              v-model="globalOptions.strict"
              type="checkbox"
              name="options.strict"
            />
            Strict
          </label>
          <label for="options.sensitive">
            <input
              id="options.sensitive"
              v-model="globalOptions.sensitive"
              type="checkbox"
              name="options.sensitive"
            />
            Sensitive
          </label>
        </fieldset>
        <input v-model="paths[0].path" type="text" />
        <input v-model="paths[1].path" type="text" />
        <button>Check</button>
      </form>

      <pre>{{ matchers }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import pathToRegexp from 'path-to-regexp'
import { PathToRank } from './types'
import { createRouteMatcher } from '~/api/path-rank'

@Component({})
export default class App extends Vue {
  paths: PathToRank[] = [
    { path: '/home', options: {} },
    { path: '/:page', options: {} },
  ]
  globalOptions: pathToRegexp.RegExpOptions = {
    strict: false,
    sensitive: false,
  }

  get matchers() {
    return this.paths.map(({ path, options }) =>
      createRouteMatcher(path, void 0, { ...this.globalOptions, ...options })
    )
  }
}
</script>
