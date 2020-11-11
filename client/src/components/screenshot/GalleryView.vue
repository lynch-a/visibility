<template>
  <v-container fluid grid-list-xl>
    <v-row>
      <v-col v-for="webpage in WEBPAGES" v-bind:key="webpage.id">
        <v-card 
          outlined
          width="300px"
          :to="{ name: 'ScreenshotDetail', params: { id: webpage.id }}"
        >
          <v-card-text>{{ webpage | fullUrl }}</v-card-text>
          <v-img
            contain
            :src=webpage.img
          ></v-img>

          <v-card-text>
            {{ webpage | fullUrl }}
          </v-card-text>

          <v-chip-group v-for="tag in webpage.tags" v-bind:key="tag.id">
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
      ...mapGetters(["WEBPAGES"])
    },

    mounted() {
      this.$store.dispatch("SET_WEBPAGE");
    },

    filters: {
      fullUrl: function(webpage) {
        return `${webpage.protocol}://${webpage.host}:${webpage.port}`;
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