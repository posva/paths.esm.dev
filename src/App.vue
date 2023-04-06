<template>
  <div class="container px-2 mx-auto md:px-4" ref="selfRef">
    <header class="my-10">
      <h1 class="font-serif text-4xl leading-tight">Path Ranker</h1>
      <h2 class="mb-4 ml-2 text-lg text-gray-600">
        A vue router path rank tester
      </h2>
    </header>

    <main class="w-100">
      <p class="max-w-3xl pl-4 mb-6 leading-tight text-md">
        Change paths entries and verify the result on the right. Entries appear
        sorted in <i>descendant</i> score order. You can customize global
        options and also apply overrides. The syntax is explained by
        <a
          href="https://next.router.vuejs.org/guide/essentials/route-matching-syntax.html"
          class="font-bold text-blue-600 hover:underline"
          >Vue Router documentation</a
        >. You can for example use custom regexes like
        <code>/:id(\d+)</code> and <i>repeatable</i> parameters like
        <code>/:id+</code>. Make sure to
        <b>double escape backslahes in your project</b>.
        <br />
        The numbers in a box that looks like this
        <span class="inline-block px-1 font-bold bg-gray-400 rounded">80</span>
        are the score of the path.
        <br />
        If you found a ranking that seems wrong, please share the URL with me by
        DM on
        <a
          class="font-bold text-blue-600 hover:underline"
          href="https://twitter.com/posva"
          >Twitter</a
        >
        or Discord.
      </p>

      <div
        class="flex flex-col content-around justify-around items-strecth lg:flex-row"
      >
        <article class="flex-1 px-1">
          <header>
            <h3 class="mb-4 font-serif text-xl">Paths to rank</h3>
          </header>
          <form @submit.prevent @reset.prevent="reset">
            <fieldset class="pb-2 pl-4 pr-1 mb-2 border">
              <legend class="p-2">
                Configure global options. They will be applied to
                <b>every</b> path.
              </legend>

              <label for="globalOptions.strict" class="block text-sm font-bold">
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
                class="block text-sm font-bold"
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
            <template v-for="(path, i) in paths" :key="i">
              <PathEntry
                :path="path"
                :active="selectedEntry === path.path"
                @focus="selectedEntry = path.path"
                @blur="selectedEntry = null"
                @enter="focusPathEntry(i + 1)"
                class="p-2 path-entry"
              />
              <hr class="h-px my-2 bg-gray-400" />
            </template>

            <button
              type="button"
              :disabled="isLinkCopied"
              class="block w-full px-4 py-2 mt-6 mb-2 font-semibold text-gray-800 bg-white border border-gray-400 rounded shadow hover:bg-gray-100 sm:inline-block lg:w-auto"
              @click="exportPaths"
            >
              {{ copyButtonText }}
            </button>
            <button
              type="button"
              class="block w-full px-4 py-2 mt-6 mb-2 font-semibold text-gray-800 bg-white border border-gray-400 rounded shadow hover:bg-gray-100 sm:inline-block lg:w-auto lg:ml-2"
              @click="() => importModalRef.open()"
            >
              Import from <code>routes</code> array
            </button>
            <button
              type="reset"
              class="block w-full px-4 py-2 font-semibold text-white bg-red-500 border border-gray-400 rounded shadow hover:bg-red-700 hover:text-gray-100 sm:inline-block lg:w-auto lg:ml-2"
            >
              Reset
            </button>
          </form>
        </article>

        <article
          class="flex-1 px-1 mt-4 text-left md:mt-0 route-matcher-container"
        >
          <header>
            <h3 class="mb-8 font-serif text-xl">Ranking results</h3>
          </header>

          <RouteMatcher
            v-for="(matcher, i) in pathMatchers"
            :key="i"
            class="mb-2"
            :matcher="matcher"
            :current-location="route"
            :active="selectedEntry === matcher.record.path"
            @focus.passive="selectedEntry = matcher.record.path"
            @blur.passive="selectedEntry = null"
            @mouseover.passive="selectedEntry = matcher.record.path"
            @mouseleave.passive="selectedEntry = null"
          />

          <label class="block mt-3">
            Test against a string location:
            <input
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              v-model="route"
              @change="saveTestRoute"
              class="block w-full px-4 py-2 mt-2 text-sm leading-normal bg-white border border-gray-300 rounded-lg appearance-none focus:outline-0 focus:shadow-outline"
              type="text"
              placeholder="/home"
            />
          </label>

          <template v-if="matchedRoute">
            <template v-if="Object.keys(matchedRoute.params).length > 0">
              <p class="my-2">Matched Params:</p>
              <ul>
                <li
                  class="list-disc list-inside"
                  v-for="(value, key) in matchedRoute.params"
                  :key="key"
                >
                  <span class="px-1 font-mono bg-gray-300 rounded-md">{{
                    key
                  }}</span
                  >: <span class="font-mono">{{ value }}</span>
                </li>
              </ul>
            </template>
            <p v-else class="my-2">
              <span class="font-mono">{{ matchedRoute.path }}</span> has no
              params.
            </p>
          </template>
          <p v-else>No match found.</p>
        </article>
      </div>

      <footer class="mt-8 mb-4 text-xs text-center text-gray-700">
        Created by Eduardo San Martin Morote
        <a
          href="https://esm.dev"
          rel="nofollow external"
          class="font-bold text-purple-500 underline"
          >@posva</a
        >
        2020 © -
        <a
          class="font-bold text-purple-500 underline"
          href="https://github.com/posva/path-rank-tester"
          rel="nofollow external"
          >Source code</a
        >
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
  LocationQueryRaw,
  START_LOCATION,
  useRoute,
  useRouter,
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
    applyOptions: true,
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
    const isLinkCopied = ref(false)

    const $route = useRoute()
    const $router = useRouter()

    const route = ref('')

    watch(
      () => $route.query.t,
      (t) => {
        route.value = (typeof t === 'string' ? t : '/') || ''
      },
      { immediate: true }
    )

    function saveTestRoute() {
      const query: LocationQueryRaw = { ...$route.query, t: route.value }
      if (!query.t) delete query.t
      $router.push({ query, hash: $route.hash })
    }

    const globalOptions = ref({ ...defaultOptions })

    const beforeLastPathEntry = computed<PathToRank | undefined>(
      () => paths.value[paths.value.length - 2]
    )

    const lastPathEntry = computed(() => {
      return paths.value[paths.value.length - 1]
    })

    const filteredPaths = computed<PathToRank[]>(() => {
      return (paths.value as PathToRank[])
        .filter((path) => path.path.startsWith('/'))
        .map((path) => {
          const copy: PathToRank = {
            ...path,
            // replace double escapes with a single escape to align better with docs
            path: path.path.replace(/\\\\/g, '\\'),
          }
          if (!path.applyOptions) {
            delete copy.sensitive
            delete copy.strict
          }
          return copy
        })
    })

    const routerMatcher = ref(createRouterMatcher([], globalOptions.value))

    const pathMatchers = computed(() => {
      const matcher = createRouterMatcher([], globalOptions.value)
      routerMatcher.value = matcher
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
          matcher.addRoute(record as any)
          matcherMap.set(name, matcher.getRecordMatcher(name)!)
        } catch (error: any) {
          error.record = record
          result.push(error as RouteRecordMatcherError)
        }
      })

      matcher
        .getRoutes()
        .forEach((route) =>
          result.push(matcherMap.get(route.record.name as symbol)!)
        )

      return result
    })

    const matchedRoute = computed(() => {
      // resolve can fail with invalid keys
      try {
        return (
          route.value &&
          routerMatcher.value.resolve({ path: route.value }, START_LOCATION)
        )
      } catch (err) {}
    })

    const copyButtonText = computed(() => {
      return isLinkCopied.value ? 'Copied!' : 'Copy Share link'
    })

    function reset() {
      paths.value = [createPathEntry('/'), createPathEntry()]
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
        $router.push({ query: { ...$route.query, p }, hash: '#' })
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
        () => beforeLastPathEntry.value?.path,
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
      const input = selfRef.value?.querySelectorAll(
        '.path-entry input[type="text"]'
      )[i] as HTMLElement

      if (input) {
        input.focus()
      } else {
        ;(document.activeElement as HTMLElement).blur()
      }
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
      matchedRoute,
      isLinkCopied,
      selectedEntry,
      reset,

      saveTestRoute,

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
