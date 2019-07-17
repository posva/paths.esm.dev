<template>
  <div>
    <header class="my-10">
      <h1 class="text-4xl font-serif leading-tight">Path Ranker</h1>
      <h2 class="text-lg text-gray-600 ml-2 mb-4">
        A vue router path rank tester
      </h2>
    </header>

    <main class="w-100">
      <p class="leading-tight text-md mb-6 max-w-3xl">
        Change paths entries and verify the result on the right. Entries appear
        sorted in <i>descendant</i> score order. You can customize global
        options and also apply overrides.
        <br />
        This uses
        <a
          href="https://github.com/pillarjs/path-to-regexp"
          class="text-blue-600 font-bold hover:underline"
          >path-to-regexp</a
        >
        to parse paths. I invite you to check its documentation to learn how to
        use custom regexes like <code>/:id(\\d+)</code> and
        <i>repeatable</i> parameters like <code>/:id+</code>.
      </p>

      <div
        class="flex items-strecth content-around justify-around flex-col md:flex-row"
      >
        <article class="flex-1 px-1">
          <header>
            <h3 class="font-serif text-xl mb-4">Paths to rank</h3>
          </header>
          <form @submit.prevent @reset.prevent="reset">
            <fieldset class="border pl-4 pr-1 pb-2 mb-2">
              <legend class="p-2">
                Configure global options. They will be applied to
                <b>every</b> path.
              </legend>

              <label for="globalOptions.strict" class="font-bold text-sm block">
                <input
                  class="leading-tight"
                  id="globalOptions.strict"
                  v-model="globalOptions.strict"
                  type="checkbox"
                  name="globalOptions.strict"
                />
                Strict
                <span class="text-xs text-gray-600"
                  >(Disallows the check of an optional <code>/</code> at the end
                  of the path)</span
                >
              </label>
              <label
                for="globalOptions.sensitive"
                class="font-bold text-sm block"
              >
                <input
                  class="leading-tight"
                  id="globalOptions.sensitive"
                  v-model="globalOptions.sensitive"
                  type="checkbox"
                  name="globalOptions.sensitive"
                />
                Case sensitive
                <span class="text-xs text-gray-600"
                  >(makes the route case sensitive)</span
                >
              </label>
            </fieldset>
            <template v-for="(path, i) in paths">
              <PathEntry
                :path="path"
                :active="selectedEntry === path.path"
                :key="i"
                class="p-2"
              />
              <hr :key="'hr' + i" class="bg-gray-400 h-px my-2" />
            </template>

            <button
              type="reset"
              class="block w-full bg-red-500 hover:bg-red-700 text-white
            hover:text-gray-100 font-semibold py-2 px-4 border border-gray-400
            rounded shadow mt-6"
            >
              Reset
            </button>
          </form>
        </article>

        <article class="flex-1 mt-4 md:mt-0 text-left px-1">
          <header>
            <h3 class="font-serif text-xl mb-8">Ranking results</h3>
          </header>
          <!-- TODO: add hover to highlight on the left -->
          <RouteMatcher
            class="mb-2"
            v-for="(matcher, i) in matchers"
            :matcher="matcher"
            :key="i"
            :current-location="route"
            @focus.native.passive="selectedEntry = matcher.path"
            @blur.native.passive="selectedEntry = null"
            @mouseover.native.passive="selectedEntry = matcher.path"
            @mouseleave.native.passive="selectedEntry = null"
          />

          <label for="check-path" class="mt-3 block">
            Test against a string location:
            <input
              id="tester.check-path"
              v-model="route"
              class="block bg-white focus:outline-0 focus:shadow-outline border border-gray-300
    rounded-lg py-2 px-4 block w-full appearance-none leading-normal text-sm mt-2"
              type="text"
              placeholder="/home"
            />
          </label>
        </article>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import pathToRegexp from 'path-to-regexp'
import { PathToRank } from './types'
import { createRouteMatcher } from '~/api/path-rank'
import PathEntry from '~/components/PathEntry.vue'
import RouteMatcher from '~/components/RouteMatcher.vue'

function createPathEntry(path = ''): PathToRank {
  return {
    path,
    options: { sensitive: false, strict: false },
    applyOptions: false,
  }
}

@Component({
  components: { PathEntry, RouteMatcher },
})
export default class App extends Vue {
  paths: PathToRank[] = [
    createPathEntry('/home'),
    createPathEntry('/:page'),
    createPathEntry(),
  ]
  selectedEntry: string | null = null
  route: string = ''

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
      .map(({ path, options, applyOptions }) => {
        try {
          return createRouteMatcher(path, void 0, {
            ...this.globalOptions,
            ...(applyOptions ? options : {}),
          })
        } catch (error) {
          return error
        }
      })
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
