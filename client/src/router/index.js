import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'
import Screenshots from '../views/Screenshots.vue'
import ScreenshotDetail from '../views/ScreenshotDetail.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/screenshots', name: 'Screenshots', component: Screenshots },
  { path: '/screenshots/:id', name: 'ScreenshotDetail', component: ScreenshotDetail}
]

const router = new VueRouter({
  routes
})

export default router
