<template>
  <div>
    <v-tabs
      v-model="active"
      exact
      fixed-tabs
      background-color="deep-purple accent-4"
      dark
    >

      <v-tab v-for="tab of tabs" :key="tab.id" :to="{ name: tab.route_name }">
        {{ tab.name }}
      </v-tab>
    </v-tabs>

    <router-view></router-view>
  </div>
</template>

<script>
// @ is an alias to /src
import Scan from '@/components/screenshot/Scan.vue'
import GalleryView from '@/components/screenshot/GalleryView.vue'
import TableView from '@/components/screenshot/TableView.vue'
import VueRouter from 'vue-router'

export default {
  name: 'ScreenshotsView',

  data() {
    return {
      active: '',
      tabs: [
        { id: 1, name: "Scan", route_name: 'ScreenshotScan' },
        { id: 2, name: "Gallery View", route_name: 'ScreenshotGallery' },
        { id: 3, name: "Table View", route_name: 'ScreenshotTable' }
      ]
    }
  },
}
</script>
