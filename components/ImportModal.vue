<template>
  <div
    class="modal-container fixed left-0 top-0 w-screen h-screen flex
  justify-center items-center"
    v-if="isOpen"
    @click="closeIfOut"
  >
    <FocusTrap active>
      <section
        class="bg-white min-h-20 w-64 sm:p-6 p-2 sm:m-0 m-2 rounded border-gray
    border-2"
        style="width: 36rem;"
        tabindex="-1"
        ref="modal"
      >
        <h2 class="text-2xl font-serif mb-2">
          Import directly from your <code>routes</code> array
        </h2>

        <p class="mb-4">
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
              class="text-blue-500 font-bold underline"
              >Vue Devtools</a
            >, select any component in the component panel (the one opened by
            default) and paste this code into the console:</span
          >

          <span class="relative m-0 block hidden sm:block">
            <pre
              class="my-2 rounded border p-4 pr-2 bg-gray-100 text-blue-600
          text-sm"
            ><code>copy(JSON.stringify($vm.$router.options.routes))</code></pre>
            <button
              class="absolute top-0 right-0 mt-3 mr-2 uppercase text-xs
          text-gray-800 font-bold
bg-white hover:bg-gray-100 py-1
            px-2 border border-gray-400 rounded shadow"
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

        <form @submit.prevent="importRoutes(routes)" ref="form">
          <p
            v-if="error"
            tabindex="-1"
            ref="error"
            class="rounded border border-red-600 bg-red-200 text-red-800 p-2 px-4 mb-4"
          >
            <b>Error parsing <code>routes</code>:</b>
            <br />
            {{ error.message }}
          </p>
          <textarea
            v-model="routes"
            ref="textarea"
            autocomplete="off"
            autocapitalize="none"
            @keypress.enter.ctrl.exact="importRoutes(routes)"
            @keypress.enter.meta.exact="importRoutes(routes)"
            spellcheck="false"
            rows="8"
            class="bg-white focus:outline-0 focus:shadow-outline border border-gray-300
    rounded-lg py-2 px-4 block w-full appearance-none leading-normal font-mono text-sm"
            placeholder="Paste here your routes array"
          ></textarea>

          <div class="flex justify-between">
            <button
              type="submit"
              class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2
            px-4 border border-gray-400 rounded shadow mt-6 mb-2 block
            w-full md:w-auto mr-1"
            >
              Import
            </button>
            <button
              type="button"
              class="bg-red-500 hover:bg-red-700 text-white
            hover:text-gray-100 font-semibold py-2
            px-4 border border-gray-400 rounded shadow mt-6 mb-2 block
            w-full md:w-auto ml-1"
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
import Vue from 'vue'
import Component from 'vue-class-component'
import copy from 'clipboard-text'
import JSON5 from 'json5'
import { PathToRank } from '../api/types'
import FocusTrap from '~/components/FocusTrap'

@Component({
  components: { FocusTrap },
})
export default class ImportModal extends Vue {
  isOpen = false
  routes = ''
  error: Error | null = null

  async open() {
    // disallow scroll
    document.body.style.overflow = 'hidden'
    this.isOpen = true
    this.routes = ''
    await this.$nextTick()
  }

  close() {
    // reset scroll
    document.body.style.overflow = 'auto'
    this.isOpen = false
  }

  closeIfOut(event) {
    if (event.target === event.currentTarget) this.close()
  }

  copySnippet(event: MouseEvent) {
    copy('copy(JSON.stringify($vm.$router.options.routes))', this.$refs
      .modal as Element)
    // @ts-ignore
    if (event.target) event.target.focus()
  }

  async importRoutes(routes: string) {
    this.error = null
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

      this.$emit('paths', paths)
      this.close()
    } catch (error) {
      console.error('Failed parsing', error)
      this.error = error
      await this.$nextTick()
      // @ts-ignore
      this.$refs.error.focus()
    }
  }
}

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

  if ((parent && !route.path) || typeof route.path !== 'string')
    throw new Error(
      `Invalid route at position ${parentIndex}: Property "path" must be a non-epmty string`
    )

  // TODO: handle children

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

  const options = Object.assign({}, parent ? parent.options : {}, routeOptions)

  const path: ParsedPathToRank = {
    path:
      // if there is a trailing slash, treat as root
      // otherwise prepend the parent path with a slash at the end of it
      route.path.charAt(0) === '/'
        ? route.path
        : (parent ? parent.path.replace(/\/*$/, '/') : '') + route.path,
    options,
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
          `${parentIndex}(${parent.path}).${i}`,
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
