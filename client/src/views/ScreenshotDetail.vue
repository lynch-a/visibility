<template>
  <div>
    <Detail/>
  </div>
</template>

<script>
import Axios from 'axios';
import Detail from '@/components/screenshot/Detail.vue'

export default {
  name: 'ScreenshotDetailView',
  components: {
    Detail
  }
}
</script>
