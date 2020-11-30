<template>
  <v-container fluid grid-list-xl>
    <v-row dense align="center">
      <v-col cols="2">
        <v-select
          v-model="pageSize"
          :items="pageSizes"
          label="Items"
          @change="handlePageChange"
        ></v-select>
      </v-col>


      <v-col>
        <v-pagination
          v-model="page"
          :length="totalPages"
          @input="handlePageChange"
        ></v-pagination>
      </v-col>
    </v-row>


    <v-row>
      <v-col v-for="webpage in WEBPAGES.webpages" v-bind:key="webpage.id">
        <v-card 
          outlined
          width="350px"
          :to="{ name: 'ScreenshotDetail', params: { id: webpage.id }}"
        >
          <v-card-text>{{ webpage | fullUrl }}</v-card-text>
          <v-img
            contain
            :src=webpage.snapshots[0].image
          ></v-img>

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

    <v-row>
      <v-pagination
        v-model="page"
        :length="totalPages"
        @input="handlePageChange"
      ></v-pagination>
    </v-row>
  </v-container>
</template>

<script>
  import {mapGetters} from 'vuex';

  export default {
    name: 'GalleryView',

    data() {
      return {
        page: 1,
        totalPages: 0,
        pageSize: 20,
        pageSizes: [10, 20, 50, 100],
        search: "",
      }
    },

    computed: {
      ...mapGetters(["WEBPAGES"])
    },
    mounted() {
      this.$store.dispatch("SET_WEBPAGE", {page: this.page, perpage: this.pageSize}).then(() => {
        console.log("webpages count: ", this.WEBPAGES.total);
        this.totalPages = parseInt(this.WEBPAGES.total / this.pageSize) + 1;
      });
    },

    filters: {
      fullUrl: function(webpage) {
        return `${webpage.protocol}://${webpage.host}:${webpage.port}`;
      }
    },
    methods: {
      handlePageChange(page) {
        this.$store.dispatch("SET_WEBPAGE", {page: this.page, perpage: this.pageSize});
        this.totalPages = parseInt(this.WEBPAGES.total / this.pageSize) + 1;
      },
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