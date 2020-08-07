<template>
  <div class="container mx-auto px-2 md:px-4" ref="selfRef">
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
        options and also apply overrides. The syntax is very similar to the one
        used by
        <a
          href="https://github.com/pillarjs/path-to-regexp"
          class="text-blue-600 font-bold hover:underline"
          >path-to-regexp</a
        >. You can check its documentation to learn how to use custom regexes
        like <code>/:id(\\d+)</code> and <i>repeatable</i> parameters like
        <code>/:id+</code>.
        <br />
        The number in a box that looks like this
        <span class="font-bold bg-gray-400 px-1 inline-block rounded"
          >[[80]]</span
        >
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
              class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow mt-6 mb-2 block sm:inline-block w-full lg:w-auto"
              @click="exportPaths"
            >
              {{ copyButtonText }}
            </button>
            <button
              type="button"
              class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow mt-6 mb-2 block sm:inline-block w-full lg:w-auto lg:ml-2"
              @click="() => importModalRef.open()"
            >
              Import from <code>routes</code> array
            </button>
            <button
              type="reset"
              class="bg-red-500 hover:bg-red-700 text-white hover:text-gray-100 font-semibold py-2 px-4 border border-gray-400 rounded shadow block sm:inline-block w-full lg:w-auto lg:ml-2"
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

          <RouteMatcher
            v-for="(matcher, i) in pathMatchers"
            :key="i"
            class="mb-2"
            :matcher="matcher"
            :current-location="route"
            :active="selectedEntry === matcher.record.path"
            @focus.native.passive="selectedEntry = matcher.record.path"
            @mouseover.native.passive="selectedEntry = matcher.record.path"
            @mouseleave.native.passive="selectedEntry = null"
          />

          <label class="mt-3 block">
            Test against a string location:
            <input
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              v-model="route"
              class="block bg-white focus:outline-0 focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal text-sm mt-2"
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
        2020 ©
      </footer>
    </main>

    <ImportModal ref="importModalRef" @paths="paths = $event"></ImportModal>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  getCurrentInstance,
} from 'vue'
import copy from 'clipboard-text'
import { compressPaths, decompressPaths } from './api/encode-data'
import {
  createRouterMatcher,
  useRoute,
  useRouter,
  RouteRecordRaw,
  _RouteRecordBase,
} from 'vue-router'
import PathEntry from './components/PathEntry.vue'
import RouteMatcher from './components/RouteMatcher.vue'
import ImportModal from './components/ImportModal.vue'
import {
  RouteRecordMatcher,
  RouteRecordMatcherError,
  PathToRank,
  PathOptions,
} from './types/matcher'

function createPathEntry(path = ''): PathToRank {
  return {
    path,
    sensitive: false,
    strict: false,
    applyOptions: false,
  }
}

const defaultPaths = [
  createPathEntry('/home'),
  createPathEntry('/:page'),
  createPathEntry(),
]

const defaultOptions: PathOptions = {
  strict: false,
  sensitive: false,
}

const defaultEncodedPaths = compressPaths(defaultPaths, defaultOptions)

export default defineComponent({
  components: { PathEntry, RouteMatcher, ImportModal },

  setup() {
    const lastEncodedPaths = ref('')
    const paths = ref<PathToRank[]>([])
    const selectedEntry = ref<string | null>(null)
    const route = ref('')
    const isLinkCopied = ref(false)

    const $route = useRoute()
    const $router = useRouter()

    const globalOptions = ref(defaultOptions)

    const beforeLastPathEntry = computed(
      () => paths.value[paths.value.length - 2]
    )

    const lastPathEntry = computed(() => {
      return paths.value[paths.value.length - 1]
    })

    const filteredPaths = computed<PathToRank[]>(() => {
      return (paths.value as PathToRank[]).filter((path) =>
        path.path.startsWith('/')
      )
    })

    const pathMatchers = computed(() => {
      const matcher = createRouterMatcher([], globalOptions.value)
      const matcherMap = new Map<
        symbol,
        RouteRecordMatcher | RouteRecordMatcherError
      >()
      const result: Array<RouteRecordMatcher | RouteRecordMatcherError> = []
      filteredPaths.value.forEach((record) => {
        const name = Symbol()
        record.name = name
        try {
          // to hard to type this one correctly
          matcher.addRoute({ ...globalOptions.value, ...record } as any)
          matcherMap.set(name, matcher.getRecordMatcher(name))
        } catch (error) {
          error.record = record
          result.push(error as RouteRecordMatcherError)
        }
      })

      matcher
        .getRoutes()
        .forEach((route) =>
          result.push(matcherMap.get(route.record.name as symbol))
        )

      return result
    })

    const copyButtonText = computed(() => {
      return isLinkCopied.value ? 'Copied!' : 'Copy Share link'
    })

    function reset() {
      paths.value = [
        createPathEntry('/home'),
        createPathEntry('/:page'),
        createPathEntry(),
      ]
    }

    function updateStateFromQuery(): void {
      const { p } = $route.query
      const encodedPaths = Array.isArray(p) ? p[0] : p

      if (encodedPaths && lastEncodedPaths.value !== encodedPaths) {
        try {
          const { paths: newPaths, options } = decompressPaths(encodedPaths)
          paths.value = newPaths
          globalOptions.value = options
          lastEncodedPaths.value = encodedPaths
        } catch (error) {
          console.error('Failed decompressing paths', error)
          // invalid parameter, reset to default
          // TODO: there seems to be something breaking on SSR but not on generation
          // force watcher
          paths.value = defaultPaths
          lastEncodedPaths.value = ''
        }
      }
    }

    function updateRouteQueryFromState() {
      try {
        const p = compressPaths(
          paths.value as PathToRank[],
          globalOptions.value
        )
        if (p === lastEncodedPaths.value) return
        // avoid recursive setting
        lastEncodedPaths.value = p
        // add a hash at the end because some links end with `.` and some programs do not
        // consider dots as parts of the url (eg: Discord)
        $router.push({ query: { p }, hash: '#' })
      } catch (error) {
        console.error('Failed compressing paths', error)
      }
    }

    // this watcher must be triggered automatically to allow SSR
    watch(() => $route.query.p, updateStateFromQuery, {
      // don't trigger the watcher on client because it would trigger an SSR mismatch
      // since we only do a generate, we get a hardcoded version of the paths (defaultPaths)
      // in development we are doing SSR so we always need to call updateRouteQueryFromState
      immediate: true,
    })

    if (!paths.value.length) {
      paths.value = defaultPaths
      lastEncodedPaths.value = defaultEncodedPaths
    }

    // we don't need the watchers during SSR
    onMounted(() => {
      // manually call the function on client to prevent SSR mismatch when a query is provided
      if (lastEncodedPaths.value !== $route.query.p) updateStateFromQuery()

      // ensure the route query is present since we generate instead of serving the app
      if (!$route.query.p)
        $router.push({ query: { p: lastEncodedPaths.value }, hash: '#' })

      watch(
        () => beforeLastPathEntry.value.path,
        (path) => {
          if (!path && paths.value.length > 2 && !lastPathEntry.value.path) {
            paths.value.pop()
          }
        }
      )

      watch(
        () => lastPathEntry.value.path,
        (path) => {
          if (path) {
            paths.value.push(createPathEntry())
          }
        }
      )

      watch(globalOptions, updateRouteQueryFromState, { deep: true })
      watch(paths, updateRouteQueryFromState, {
        deep: true,
        immediate: true,
      })
    })

    function exportPaths() {
      copy(window.location.href)
      isLinkCopied.value = true
      setTimeout(() => {
        isLinkCopied.value = false
      }, 1000)
    }

    const selfRef = ref<Element>()
    const importModalRef = ref<Element>()

    function focusPathEntry(i: number) {
      const input = selfRef.value.querySelectorAll(
        '.path-entry input[type="text"]'
      )[i] as HTMLElement

      if (input) input.focus()
      else (document.activeElement as HTMLElement).blur()
    }

    return {
      paths,
      lastEncodedPaths,
      exportPaths,
      focusPathEntry,
      updateRouteQueryFromState,
      updateStateFromQuery,
      copyButtonText,
      pathMatchers,
      filteredPaths,
      lastPathEntry,
      beforeLastPathEntry,
      globalOptions,
      route,
      isLinkCopied,
      selectedEntry,
      reset,

      selfRef,
      importModalRef,
    }
  },
})
</script>

<style scoped>
@media (min-width: 1024px) {
  .route-matcher-container {
    max-width: 50%;
  }
}
</style>
