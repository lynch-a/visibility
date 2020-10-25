<template>
  <v-container>
    <v-row>
      <v-col v-for="host in HOSTS" v-bind:key="host.id">
        <v-card max-width=374>
          <v-img
            contain
            max-height="400"
            max-width="400"
            :src=host.img
            width=100%
          ></v-img>

          <v-card-title>
            {{ host | formatHost }}
          </v-card-title>

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
    name: 'Overview',

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
