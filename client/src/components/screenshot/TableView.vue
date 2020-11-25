<template>
  <div>
    <v-text-field
      v-model="search"
      append-icon="mdi-magnify"
      label="Search"
      single-line
      hide-details
    ></v-text-field>

    <v-data-table
        :headers="headers"
        :items="WEBPAGES"
        :items-per-page="50"
        class="elevation-1"
        :search="search"
      >

      <template v-slot:item.host="{ item }">
        <router-link :to="{ name: 'ScreenshotDetail', params: {id: item.id}}">
          {{ item | fullUrl }}
        </router-link>
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
      this.$store.dispatch("SET_WEBPAGE");
    },

    filters: {
      fullUrl: function(webpage) {
        return `${webpage.protocol}://${webpage.host}:${webpage.port}`;
      }
    },
    methods: {
      //handleClick(value) {
      // console.log(value);
      //  this.$router.push({name: "ScreenshotDetail", params: {id: value.id}});
      //},
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