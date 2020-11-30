<template>
  <div>
    <v-card>
      <v-card-title>{{ webpage | fullUrl }}</v-card-title>
      <v-card-subtitle>Screenshot taken: {{ snapshots[model].createdAt }}</v-card-subtitle>
      <v-carousel v-model="model" height="auto">
        <v-carousel-item
          v-for="(snapshot, i) in snapshots"
          :key="snapshot.id"
          :src="snapshots[i].image"
        >
        </v-carousel-item>
      </v-carousel>

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
            <tr v-for="(header_value, header_key) in snapshots[model].headers" v-bind:key="header_key">
              <td class="text-right nowrap">{{ header_key }}</td>
              <td class="wrap">{{ header_value }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import Axios from 'axios';

  export default {
    name: 'Detail',

    data() {
      return {
        model: 1,
        webpage: {},
        snapshots: {}
      }
    },

    computed: {
      
    },

    mounted() {
      Axios.get('http://localhost:3000/webpages/' + this.$route.params.id).then(
        response => {
          this.webpage = response.data.webpage;
          this.snapshots = response.data.snapshots;
          this.model = this.snapshots.length-1;
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