import { RouteRecordRaw } from 'vue-router'
import Home from './views/Home.vue'
// import About from './views/About.vue'
// import NotFound from './views/NotFound.vue'

export let routes: RouteRecordRaw[] = [{ path: '/:a(.*)*', component: Home }]
