import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'
import { routes } from './routes'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { loadServiceWorker } from './loadSW'

let app = createApp(App)
let router = createRouter({
  history: createWebHistory(),
  // @ts-ignore
  routes: import.meta.hot ? [] : routes,
})

if (import.meta.hot) {
  let removeRoutes: ReturnType<Router['addRoute']>[] = []

  for (let route of routes) {
    removeRoutes.push(router.addRoute(route))
  }

  import.meta.hot!.accept('./routes.js', ({ routes }) => {
    for (let removeRoute of removeRoutes) removeRoute()
    removeRoutes = []
    for (let route of routes) {
      removeRoutes.push(router.addRoute(route))
    }
    router.replace('')
  })
} else {
  // production only
  loadServiceWorker()
}

app.use(router)

router.isReady().then(() => app.mount('#app'))
