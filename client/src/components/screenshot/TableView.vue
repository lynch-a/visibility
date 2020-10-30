<template>
  <v-data-table
    :headers="headers"
    :items="WEBPAGES"
    :items-per-page="50"
    class="elevation-1"
  ></v-data-table>
</template>

<script>
  import {mapGetters} from 'vuex';

  export default {
    name: 'TableView',

    data() {
      return {
        headers: [
          {
            text: 'URL',
            value: 'host'
          },
          {
            text: "Response",
            value: "response_code"
          },
          {
            text: "Title",
            value: "page_title"
          }

        ],
      }
    },

    computed: {
      ...mapGetters(["WEBPAGES"])
    },

    mounted() {
      this.$store.dispatch("SET_WEBPAGE");
    },

    filters: {
      formatHost: function(host) {
        return `${host.protocol}://${host.host}:${host.port}`;
      }
    }
  }

</script>

<style>
/*
  .container {
    border: 1px solid green;
  }

  .row {
    border: 1px solid red;
  }

  .col {
    border: 1px solid blue;
  }
*/
</style>