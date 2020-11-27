<template>
  <div>
    {{ webpage | fullUrl }}
    <v-carousel v-model="model">
      <v-carousel-item
        v-for="(snapshot, i) in snapshots"
        :key="snapshot.id"
      >
        <img :src="snapshots[i].image">
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
          <tr v-for="(header_value, header_key) in snapshots[active].headers" v-bind:key="header_key">
            <td class="text-right nowrap">{{ header_key }}</td>
            <td class="wrap">{{ header_value }}</td>
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
        active: 1,
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