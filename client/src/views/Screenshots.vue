<template>
  <div>
    <v-tabs
      fixed-tabs
      background-color="deep-purple accent-4"
      dark
    >
      <v-tab>
        Scan
      </v-tab>

      <v-tab>
        Gallery View
      </v-tab>

      <v-tab>
        Table View
      </v-tab>

      <v-tab-item>
        <Scan/>
      </v-tab-item>

      <v-tab-item>
        <GalleryView/>
      </v-tab-item>

      <v-tab-item>
        <TableView/>
      </v-tab-item>  
    </v-tabs>
  </div>
</template>

<script>
// @ is an alias to /src
import Scan from '@/components/screenshot/Scan.vue'
import GalleryView from '@/components/screenshot/GalleryView.vue'
import TableView from '@/components/screenshot/TableView.vue'

export default {
  name: 'ScreenshotsView',
  components: {
    Scan,
    GalleryView,
    TableView
  }
}
</script>
