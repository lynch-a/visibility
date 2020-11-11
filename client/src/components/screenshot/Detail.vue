<template>
  <div>
    <v-img src=""
  </div>
</template>

<script>
  export default {
    name: 'Detail',

    data() {
      return {
        data
      }
    },

    computed: {
      
    },

    mounted() {
      Axios.get('http://localhost:3000/webpages/');
    },

    filters: {
      fullUrl: function(webpage) {
        return `${webpage.protocol}://${webpage.host}:${webpage.port}`;
      }
    }
  }

</script>

<style>

</style>