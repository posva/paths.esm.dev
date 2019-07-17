<template>
  <div class="container">
    <div>
      <h1 class="title">path-ranker</h1>
      <h2 class="subtitle">A vue router path ranker tester</h2>
      <form @submit.prevent @reset.prevent="reset">
        <fieldset>
          <label for="globalOptions.strict">
            <input
              id="globalOptions.strict"
              v-model="globalOptions.strict"
              type="checkbox"
              name="globalOptions.strict"
            />
            Strict
          </label>
          <label for="globalOptions.sensitive">
            <input
              id="globalOptions.sensitive"
              v-model="globalOptions.sensitive"
              type="checkbox"
              name="globalOptions.sensitive"
            />
            Sensitive
          </label>
        </fieldset>
        <PathEntry v-for="(path, i) in paths" :path="path" :key="i" />

        <button type="reset">Reset</button>
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
import PathEntry from '~/components/PathEntry.vue'

function createPathEntry(path = ''): PathToRank {
  return {
    path,
    options: { sensitive: false, strict: false },
    applyOptions: false,
  }
}

@Component({
  components: { PathEntry },
})
export default class App extends Vue {
  paths: PathToRank[] = [
    createPathEntry('/home'),
    createPathEntry('/:page'),
    createPathEntry(),
  ]

  globalOptions: pathToRegexp.RegExpOptions = {
    strict: false,
    sensitive: false,
  }

  get beforeLastPathEntry() {
    return this.paths[this.paths.length - 2]
  }
  get lastPathEntry() {
    return this.paths[this.paths.length - 1]
  }

  get matchers() {
    return this.paths
      .filter(({ path }) => !!path)
      .map(({ path, options, applyOptions }) =>
        createRouteMatcher(path, void 0, {
          ...this.globalOptions,
          ...(applyOptions ? options : {}),
        })
      )
      .sort((a, b) => b.score - a.score)
  }

  reset() {
    this.paths = [
      createPathEntry('/home'),
      createPathEntry('/:page'),
      createPathEntry(),
    ]
  }

  created() {
    this.$watch('beforeLastPathEntry.path', (path) => {
      if (!path && this.paths.length > 2 && !this.lastPathEntry.path) {
        this.paths.pop()
      }
    })

    this.$watch('lastPathEntry.path', (path) => {
      if (path) {
        this.paths.push(createPathEntry())
      }
    })
  }
}
</script>
