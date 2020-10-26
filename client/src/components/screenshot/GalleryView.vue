<template>
  <v-container fluid grid-list-xl>
    <v-row>
      <v-col v-for="host in HOSTS" v-bind:key="host.id">
        <v-card 
          outlined
          width="300px"
        >
          <v-card-text>{{ host | formatHost }}</v-card-text>
          <v-img
            contain
            :src=host.img
          ></v-img>

          <v-card-text>
            {{ host | formatHost }}
          </v-card-text>

          <v-chip-group v-for="tag in host.tags" v-bind:key="tag.id">
            <v-chip class="ma-2" color="primary">{{ tag.text }}</v-chip>
          </v-chip-group>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn icon>
              <v-icon>mdi-heart</v-icon>
            </v-btn>

            <v-btn icon>
              <v-icon>mdi-bookmark</v-icon>
            </v-btn>

            <v-btn icon>
              <v-icon>mdi-share-variant</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import {mapGetters} from 'vuex';

  export default {
    name: 'GalleryView',

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