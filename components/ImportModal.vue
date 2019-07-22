<template>
  <div
    class="modal-container absolute left-0 top-0 w-screen h-screen flex
  justify-center items-center"
    v-if="isOpen"
    @click="closeIfOut"
  >
    <section
      class="bg-white min-h-20 max-w-xl md:p-6 p-2 md:m-0 m-2 rounded border-gray
    border-2"
      tabindex="-1"
      ref="modal"
    >
      <h2 class="text-2xl font-serif mb-2">
        Import directly from your <code>routes</code> array
      </h2>

      <p class="mb-4">
        You can copy paste the array of <code>routes</code> passed to
        <code>new Router()</code>. We use <code>json5</code> to parse it, so if
        it contains any extra Javascript like <b>navigation guards</b>(eg:
        <code>beforeEnter</code>), <b>inlined dynamic imports</b>(eg:
        <code>import('./Login.vue')</code>). If you are using <i>Nuxt</i>, you
        don't have access to the array itself, or it's too difficult to copy,
        you can open your application in development mode 👩‍💻, open the
        <a
          href="https://github.com/vuejs/vue-devtools"
          target="_blank"
          class="text-blue-500 font-bold underline"
          >Vue Devtools</a
        >, select any component in the component panel (the one opened by
        default) and paste this code into the console:

        <span class="relative m-0 block">
          <pre
            class="my-2 rounded border p-4 pr-2 bg-gray-100 text-blue-600
          text-sm"
          ><code>copy(JSON.stringify($vm.$router.options.routes))</code></pre>
          <button
            class="absolute top-0 right-0 mt-3 mr-2 uppercase text-xs
          text-gray-800 font-bold
bg-white hover:bg-gray-100 py-1
            px-2 border border-gray-400 rounded shadow"
            @click="copySnippet"
          >
            Copy
          </button>
        </span>

        It will copy your <code>routes</code> array into your 📋 clipboard, you
        can now paste it below:
      </p>

      <form @submit.prevent="importRoutes(routes)" ref="form">
        <p
          v-if="error"
          class="rounded border border-red-600 bg-red-200 text-red-800 p-2 px-4 mb-4"
        >
          <b>Error parsing <code>routes</code>:</b>
          <br />
          {{ error.message }}
        </p>
        <textarea
          v-model="routes"
          ref="textarea"
          autofocus
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

        <button
          type="submit"
          class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2
            px-4 border border-gray-400 rounded shadow mt-6 mb-2 block
            sm:inline-block w-full lg:w-auto"
        >
          Import
        </button>
      </form>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import copy from 'copy-text-to-clipboard'
import JSON5 from 'json5'

@Component({})
export default class ImportModal extends Vue {
  isOpen = false
  routes = ''
  error: Error | null = null

  async open() {
    // disallow scroll
    document.body.style.overflow = 'hidden'
    this.isOpen = true
    await this.$nextTick()
    // @ts-ignore
    this.$refs.modal.focus()
  }

  close() {
    // reset scroll
    delete document.body.style.overflow
    this.isOpen = false
  }

  closeIfOut(event) {
    if (event.target === event.currentTarget) this.close()
  }

  copySnippet() {
    copy('copy(JSON.stringify($vm.$router.options.routes))')
  }

  async importRoutes(routes: string) {
    this.error = null
    try {
      const routeConfig = JSON5.parse(routes)
      console.log(routeConfig)
    } catch (error) {
      console.error('Failed parsing', error)
      this.handleError(error)
    }
  }

  handleError(error) {
    this.error = error
  }

  mounted() {
    // during testing
    this.open()
  }
}
</script>

<style scoped>
.modal-container {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
