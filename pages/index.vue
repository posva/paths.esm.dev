<template>
  <div>
    <header class="my-10">
      <h1 class="text-4xl font-serif leading-tight">Path Ranker</h1>
      <h2 class="text-lg text-gray-600 ml-2 mb-4">
        A vue router path rank tester
      </h2>
    </header>

    <main class="w-100">
      <p class="leading-tight text-md mb-6 max-w-3xl pl-4">
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
        <br />
        The number in a box that looks like this
        <span class="font-bold bg-gray-400 px-1 inline-block rounded">5</span>
        is the score of the path.
        <br />
        If you found a ranking that seems wrong, please share the URL with me by
        DM on
        <a
          class="text-blue-600 font-bold hover:underline"
          href="https://twitter.com/posva"
          >Twitter</a
        >
        or Discord.
      </p>

      <div
        class="flex items-strecth content-around justify-around flex-col lg:flex-row"
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
                  id="globalOptions.strict"
                  v-model="globalOptions.strict"
                  class="leading-tight"
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
                  id="globalOptions.sensitive"
                  v-model="globalOptions.sensitive"
                  class="leading-tight"
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
                :key="i"
                :path="path"
                :active="selectedEntry === path.path"
                @focus="selectedEntry = path.path"
                @blur="selectedEntry = null"
                @enter="focusPathEntry(i + 1)"
                class="p-2 path-entry"
              />
              <hr :key="'hr' + i" class="bg-gray-400 h-px my-2" />
            </template>

            <button
              type="button"
              :disabled="isLinkCopied"
              class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2
            px-4 border border-gray-400 rounded shadow mt-6 mb-2 block
            sm:inline-block w-full lg:w-auto"
              @click="exportPaths"
            >
              {{ copyButtonText }}
            </button>
            <button
              type="button"
              class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2
            px-4 border border-gray-400 rounded shadow mt-6 mb-2 block
            sm:inline-block w-full lg:w-auto"
              @click="() => $refs.importModal.open()"
            >
              Import from <code>routes</code> array
            </button>
            <button
              type="reset"
              class="bg-red-500 hover:bg-red-700 text-white
            hover:text-gray-100 font-semibold py-2 px-4 border border-gray-400
            rounded shadow block sm:inline-block w-full lg:w-auto"
            >
              Reset
            </button>
          </form>
        </article>

        <article
          class="flex-1 mt-4 md:mt-0 text-left px-1 route-matcher-container"
        >
          <header>
            <h3 class="font-serif text-xl mb-8">Ranking results</h3>
          </header>
          <!-- TODO: add hover to highlight on the left -->
          <RouteMatcher
            v-for="(matcher, i) in matchers"
            :key="i"
            class="mb-2"
            :matcher="matcher"
            :current-location="route"
            :active="selectedEntry === matcher.path"
            @focus.native.passive="selectedEntry = matcher.path"
            @mouseover.native.passive="selectedEntry = matcher.path"
            @mouseleave.native.passive="selectedEntry = null"
          />

          <label for="check-path" class="mt-3 block">
            Test against a string location:
            <input
              id="tester.check-path"
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              v-model="route"
              class="block bg-white focus:outline-0 focus:shadow-outline border border-gray-300
    rounded-lg py-2 px-4 block w-full appearance-none leading-normal text-sm mt-2"
              type="text"
              placeholder="/home"
            />
          </label>
        </article>
      </div>

      <footer class="text-xs text-gray-700 mt-8 mb-4 text-center">
        Created by Eduardo San Martin Morote
        <a href="https://esm.dev" class="text-purple-500 font-bold underline"
          >@posva</a
        >
        2019 ©
      </footer>
    </main>
    <ImportModal ref="importModal" @paths="paths = $event"></ImportModal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import pathToRegexp from 'path-to-regexp'
import { copy } from '~/api/copy.ts'
import { PathToRank, RequiredPathOptions } from '~/api/types'
import { compressPaths, decompressPaths } from '~/api/encode-data'
import { createRouteMatcher } from '~/api/path-rank'
import PathEntry from '~/components/PathEntry.vue'
import RouteMatcher from '~/components/RouteMatcher.vue'
import ImportModal from '~/components/ImportModal.vue'

function createPathEntry(path = ''): PathToRank {
  return {
    path,
    options: { sensitive: false, strict: false },
    applyOptions: false,
  }
}

const defaultPaths = [
  createPathEntry('/home'),
  createPathEntry('/:page'),
  createPathEntry(),
]

const defaultOptions: RequiredPathOptions = {
  strict: false,
  sensitive: false,
}
const defaultEncodedPaths = compressPaths(defaultPaths, defaultOptions)

@Component({
  components: { PathEntry, RouteMatcher, ImportModal },
})
export default class App extends Vue {
  lastEncodedPaths: string = ''
  paths: PathToRank[] = []
  selectedEntry: string | null = null
  route: string = ''
  isLinkCopied = false

  globalOptions: RequiredPathOptions = defaultOptions

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

  get copyButtonText() {
    return this.isLinkCopied ? 'Copied!' : 'Copy Share link'
  }

  reset() {
    this.paths = [
      createPathEntry('/home'),
      createPathEntry('/:page'),
      createPathEntry(),
    ]
  }

  updateStateFromQuery(): void {
    const { p } = this.$route.query
    const encodedPaths = Array.isArray(p) ? p[0] : p

    if (encodedPaths && this.lastEncodedPaths !== encodedPaths) {
      try {
        const { paths, options } = decompressPaths(encodedPaths)
        this.paths = paths
        this.globalOptions = options
        this.lastEncodedPaths = encodedPaths
      } catch (error) {
        console.error('Failed decompressing paths', error)
        // invalid parameter, reset to default
        // TODO: there seems to be something breaking on SSR but not on generation
        this.paths = defaultPaths
        // force watcher
        this.lastEncodedPaths = ''
      }
    }
  }

  updateRouteQueryFromState() {
    try {
      const p = compressPaths(this.paths, this.globalOptions)
      if (p === this.lastEncodedPaths) return
      // avoid recursive setting
      this.lastEncodedPaths = p
      this.$router.push({ query: { p } })
    } catch (error) {
      console.error('Failed compressing paths', error)
    }
  }

  created() {
    // this watcher must be triggered automatically to allow SSR
    this.$watch('$route.query.p', this.updateStateFromQuery, {
      // don't trigger the watcher on client because it would trigger an SSR mismatch
      // since we only do a generate, we get a hardcoded version of the paths (defaultPaths)
      immediate: process.server,
    })

    if (!this.paths.length) {
      this.paths = defaultPaths
      this.lastEncodedPaths = defaultEncodedPaths
    }
  }

  // we don't need the watchers during SSR
  mounted() {
    // manually call the function on client to prevent SSR mismatch when a query is provided
    if (this.lastEncodedPaths !== this.$route.query.p)
      this.updateStateFromQuery()

    // ensure the route query is present since we generate instead of serving the app
    if (!this.$route.query.p)
      this.$router.push({ query: { p: this.lastEncodedPaths } })

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

    this.$watch('globalOptions', this.updateRouteQueryFromState, { deep: true })
    this.$watch('paths', this.updateRouteQueryFromState, {
      deep: true,
      immediate: true,
    })
  }

  exportPaths() {
    copy(window.location.href)
    this.isLinkCopied = true
    setTimeout(() => {
      this.isLinkCopied = false
    }, 1000)
  }

  focusPathEntry(i: number) {
    const input = this.$el.querySelectorAll('.path-entry input[type="text"]')[
      i
    ] as HTMLElement

    if (input) input.focus()
    else (document.activeElement as HTMLElement).blur()
  }
}
</script>

<style scoped>
@media (min-width: 1024px) {
  .route-matcher-container {
    max-width: 50%;
  }
}
</style>

