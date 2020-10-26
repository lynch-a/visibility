<template>
  <v-data-table
    :headers="headers"
    :items="HOSTS"
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
            value: "200"
          },
          {
            text: "Title",
            value: "placeholder title"
          }

        ],
      }
    },

    computed: {
      ...mapGetters(["HOSTS"])
    },

    mounted() {
      this.$store.dispatch("SET_HOST");
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