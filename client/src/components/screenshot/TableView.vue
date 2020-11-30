<template>
  <div>
    <v-text-field
      v-model="search"
      append-icon="mdi-magnify"
      label="Search"
      single-line
      hide-detailsz
    ></v-text-field>

    <v-data-table
        :headers="headers"
        :items="WEBPAGES.webpages"
        :items-per-page="50"
        class="elevation-1"
        :search="search"
      >

      <template v-slot:item.host="{ item }">
        <router-link :to="{ name: 'ScreenshotDetail', params: {id: item.id}}">
          {{ item | fullUrl }}
        </router-link>
      </template>

      <template v-slot:item.response_code="{ item }">
        {{ latestStatusCode(item) }}
      </template>

      <template v-slot:item.page_title="{ item }">
        {{ latestPageTitle(item) }}
      </template>
    
    </v-data-table>
  </div>
</template>


<script>
  import {mapGetters} from 'vuex';

  export default {
    name: 'TableView',

    data() {
      return {
        search: '',
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
      console.log("doing  thing");
      this.$store.dispatch("SET_WEBPAGE");
    },

    filters: {
      fullUrl: function(webpage) {
        return `${webpage.protocol}://${webpage.host}:${webpage.port}`;
      }
    },
    methods: {
      latestStatusCode: function(webpage) {
        if (webpage.snapshots !== undefined) {
          if (webpage.snapshots[0] !== undefined) {
            return webpage.snapshots[0].status_code;
          }
        }
        return "N/A"
      },
      latestPageTitle: function(webpage) {
        if (webpage.snapshots !== undefined) {
          if (webpage.snapshots[0] !== undefined) {
            return webpage.snapshots[0].page_title;
          }
        }
        return "N/A"
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