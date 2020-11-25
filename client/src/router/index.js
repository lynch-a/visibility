import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'
import Screenshots from '../views/Screenshots.vue'
import ScreenshotScan from '../components/screenshot/Scan.vue'
import ScreenshotGallery from '../components/screenshot/GalleryView.vue'
import ScreenshotTable from '../components/screenshot/TableView.vue'
import ScreenshotDetail from '../views/ScreenshotDetail.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', name: 'Home', component: Home },

  {
    path: '/screenshots', name: 'Screenshots', component: Screenshots,
    children: [
      { path: 'scan', name: 'ScreenshotScan', component: ScreenshotScan },
      { path: 'gallery', name: 'ScreenshotGallery', component: ScreenshotGallery },
      { path: 'table', name: 'ScreenshotTable', component: ScreenshotTable },
      { path: ':id', name: 'ScreenshotDetail', component: ScreenshotDetail}
    ]
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
