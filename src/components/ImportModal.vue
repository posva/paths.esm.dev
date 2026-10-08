<template>
  <div
    class="fixed top-0 left-0 flex items-center justify-center w-screen h-screen modal-container"
    v-if="isOpen"
    @click="closeIfOut"
    ref="modalRef"
  >
    <FocusTrap @deactivate="close" :initial-focus="() => textareaRef">
      <!-- NOTE: if we add aria-labeledby and describedby, screen readers repeat the
      whole thing -->
      <section
        class="w-64 p-2 m-2 bg-white border-2 rounded min-h-20 sm:p-6 sm:m-0 border-gray"
        role="dialog"
        style="width: 36rem"
      >
        <h2 class="mb-2 font-serif text-2xl" id="import-modal-title">
          Import directly from your <code>routes</code> array
        </h2>

        <p class="mb-4" id="import-modal-desc">
          You can copy paste the array of <code>routes</code> passed to
          <code>new Router()</code>. We use <code>json5</code> to parse it, so
          if it contains any extra Javascript like <b>navigation guards</b>(eg:
          <code>beforeEnter</code>), <b>inlined dynamic imports</b>(eg:
          <code>import('./Login.vue')</code>).
          <span class="hidden sm:block"
            >If you are using <i>Nuxt</i>, you don't have access to the array
            itself, or it's too difficult to copy, you can open your application
            in development mode <span aria-hidden="true">👩‍💻</span>, open the
            <a
              href="https://github.com/vuejs/vue-devtools"
              target="_blank"
              class="font-bold text-blue-500 underline"
              >Vue Devtools</a
            >, select any component in the component panel (the one opened by
            default) and paste this code into the console:</span
          >

          <span class="relative block m-0">
            <pre
              class="p-4 pr-2 my-2 text-sm text-blue-600 bg-gray-100 border rounded"
            ><code>copy(JSON.stringify($vm.$router.options.routes))</code></pre>
            <button
              class="absolute top-0 right-0 px-2 py-1 mt-3 mr-2 text-xs font-bold text-gray-800 uppercase bg-white border border-gray-400 rounded shadow hover:bg-gray-100"
              type="button"
              @click="copySnippet"
            >
              Copy
            </button>
          </span>

          It will copy your <code>routes</code> array into your
          <span aria-hidden="true">📋</span> clipboard, you can now paste it
          below:
        </p>

        <form @submit.prevent="importRoutes(routes)" ref="formRef">
          <p
            v-if="error"
            tabindex="-1"
            ref="errorRef"
            class="p-2 px-4 mb-4 text-red-800 bg-red-200 border border-red-600 rounded"
          >
            <b>Error parsing <code>routes</code>:</b>
            <br />
            {{ error.message }}
          </p>
          <textarea
            v-model="routes"
            ref="textareaRef"
            autocomplete="off"
            autocapitalize="none"
            @keypress.enter.ctrl.exact="importRoutes(routes)"
            @keypress.enter.meta.exact="importRoutes(routes)"
            spellcheck="false"
            rows="8"
            class="block w-full px-4 py-2 font-mono text-sm leading-normal bg-white border border-gray-300 rounded-lg"
            placeholder="Paste here your routes array"
          ></textarea>

          <div class="flex justify-between">
            <button
              type="submit"
              class="block w-full px-4 py-2 mt-6 mb-2 mr-1 font-semibold text-gray-800 bg-white border border-gray-400 rounded shadow hover:bg-gray-100 md:w-auto"
            >
              Import
            </button>
            <button
              type="button"
              class="block w-full px-4 py-2 mt-6 mb-2 ml-1 font-semibold text-white bg-red-500 border border-gray-400 rounded shadow hover:bg-red-700 hover:text-gray-100 md:w-auto"
              @click="close"
            >
              Close
            </button>
          </div>
        </form>
      </section>
    </FocusTrap>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick } from 'vue'
import copy from 'clipboard-text'
import JSON5 from 'json5'
import { PathToRank } from '../types/matcher'
import { FocusTrap } from 'focus-trap-vue'

export default defineComponent({
  components: { FocusTrap },

  setup(props, { emit }) {
    const isOpen = ref(false)
    const routes = ref('')
    const error = ref<Error | null>(null)

    const modalRef = ref<Element>()
    const errorRef = ref<Element>()
    const formRef = ref<Element>()
    const textareaRef = ref<Element>()

    function open() {
      // disallow scroll
      document.body.style.overflow = 'hidden'
      isOpen.value = true
      routes.value = ''
      return nextTick()
    }

    function close() {
      // reset scroll
      document.body.style.overflow = 'auto'
      isOpen.value = false
    }

    function closeIfOut(event: PointerEvent) {
      if (event.target === event.currentTarget) close()
    }

    function copySnippet(event: MouseEvent) {
      copy(
        'copy(JSON.stringify($vm.$router.options.routes))',
        modalRef.value?.querySelector('section[role="dialog"]')!
      )
      // @ts-ignore
      if (event.target) event.target.focus()
    }

    async function importRoutes(routes: string) {
      error.value = null
      // let routeConfig: any[] | null = null
      try {
        const routeConfig = JSON5.parse(routes)
        if (!Array.isArray(routeConfig))
          throw new Error('You must provide an Array')

        if (!routeConfig.length) throw new Error('The array cannot be empty')

        // transform into paths
        const paths: ParsedPathToRank[] = []

        for (let i = 0; i < routeConfig.length; i++) {
          addRouteToPaths(routeConfig[i], null, String(i), paths)
        }

        emit('paths', paths)
        close()
      } catch (err) {
        console.error('Failed parsing', err)
        error.value = err as Error
        await nextTick()
        // @ts-expect-error: FIXME:
        errorRef.value!.focus()
      }
    }

    return {
      errorRef,
      modalRef,
      textareaRef,
      formRef,

      isOpen,
      error,
      routes,

      open,
      close,
      closeIfOut,
      copySnippet,
      importRoutes,
    }
  },
})

/**
 * Testing string
 * [{ path: '/one', alias: ['/one2', '/one3'], children: [{ path: 'two', children: [{ path: 'three'},{ path: '/root', alias: ['/root2', 'three2'], children: [{ path: 'four'}] }]}]}]
 */

interface ParsedPathToRank extends PathToRank {
  parentPath: string | null
}

function addRouteToPaths(
  route: any,
  parent: PathToRank | null,
  parentIndex: string,
  paths: ParsedPathToRank[]
): PathToRank {
  if (!route || typeof route !== 'object')
    throw new Error(
      `Invalid route at position ${parentIndex}: Expected an Object, got "${JSON5.stringify(
        route
      )}"`
    )

  if ((!route.path && !parent) || typeof route.path !== 'string')
    throw new Error(
      `Invalid route at position ${parentIndex}: Property "path" must be a non-empty string`
    )

  const sensitive: boolean =
    'caseSensitive' in route
      ? route.caseSensitive
      : route.pathToRegexpOptions && route.pathToRegexpOptions.sensitive
  const strict: boolean =
    'strict' in route
      ? route.strict
      : route.pathToRegexpOptions && route.pathToRegexpOptions.strict

  const routeOptions = { strict, sensitive }
  if (strict !== null) delete routeOptions.strict
  if (sensitive !== null) delete routeOptions.sensitive

  const options = Object.assign(
    {},
    parent
      ? { strict: parent.strict, end: parent.end, sensitive: parent.sensitive }
      : {},
    routeOptions
  )

  const path: ParsedPathToRank = {
    path:
      // if there is a trailing slash, treat as root
      // otherwise prepend the parent path with a slash at the end of it
      route.path.charAt(0) === '/'
        ? route.path
        : (parent ? parent.path.replace(/\/*$/, '/') : '') + route.path,
    ...options,
    parentPath: parent && parent.path,
    applyOptions: false,
  }

  // ensure we do not add duplicates, this is necessary because of aliases with children
  // if the child is a root path like /root instead of root, it will be added twice
  if (
    !paths.find(
      (p) => p.path === path.path && p.parentPath === (parent && parent.path)
    )
  ) {
    paths.push(path)
  } else {
    // we can also stop because we have already added any children
    return path
  }

  // save the alias as parents to generate all possible children
  const parents: PathToRank[] = [path]

  if (route.alias) {
    const aliases = Array.isArray(route.alias) ? route.alias : [route.alias]
    for (const alias of aliases) {
      parents.push(
        addRouteToPaths(
          { path: alias },
          parent,
          `${parentIndex}.${alias}`,
          paths
        )
      )
    }
  }

  if (route.children) {
    if (!Array.isArray(route.children))
      throw new Error(
        `Invalid route at position ${parentIndex}: Property "children" must be an array`
      )

    for (const parent of parents) {
      for (let i = 0; i < route.children.length; i++) {
        addRouteToPaths(
          route.children[i],
          parent,
          `${parentIndex} "${parent.path}".${i}`,
          paths
        )
      }
    }
  }

  return path
}
</script>

<style scoped>
.modal-container {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
