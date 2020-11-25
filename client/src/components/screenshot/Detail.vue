<template>
  <div>
    {{ webpage | fullUrl }}

    <v-img
      contain
      max-width="600"
      :src=webpage.img
    ></v-img>

    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-right">
              Header
            </th>
            <th class="text-left">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="header in headers" :key="header.key">
            <td class="text-right nowrap">{{header.key}}</td>
            <td class="wrap">{{header.value}}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
  import Axios from 'axios';

  export default {
    name: 'Detail',

    data() {
      return {
        webpage: {},
        headers: []
      }
    },

    computed: {
      
    },

    mounted() {
      Axios.get('http://localhost:3000/webpages/' + this.$route.params.id).then(
        response => {
          this.webpage = response.data.page;
          this.headers = response.data.headers;
        }
      )
    },

    filters: {
      fullUrl: function(webpage) {
        return `${webpage.protocol}://${webpage.host}:${webpage.port}`;
      }
    }
  }

</script>

<style>
  .nowrap {
    white-space:nowrap;
  }

  .wrap {
    word-wrap: break-word;
    word-break: break-all;
  }
</style>