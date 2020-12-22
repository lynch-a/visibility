<template>
  <v-app>
    <TopNav/>
    <v-main>
      <router-view></router-view>
      <v-snackbar
        v-for="(snackbar, index) in snackbars"
        :key="snackbar.text + Math.random()"
        v-model="snackbar.showing"
        absolute
        :color="snackbar.color"
        :style="`top: -${(index * 60) + 8}px`"
      >
        <b>{{ snackbar.text }}</b>

        <template v-slot:action="{ attrs }">
          <v-btn
            text
            @click="snackbar.showing = false"
            v-bind="attrs"
          >
            Close
          </v-btn>
        </template>

      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>
//import HelloWorld from './components/HelloWorld';
import TopNav from './components/TopNav';
import { mapState } from 'vuex';

export default {
  name: 'App',

  components: {
    TopNav,
  },

  sockets: {
    "screenshot-taken": function(data) {
      console.log("ss-taken: ", data);
      this.$store.dispatch("ADD_WEBPAGE", data);
    },
    "worker-update": function(data) {
      console.log("updating worker: ", data);
      this.$store.dispatch("UPDATE_WORKER", data);
    },

    connect: function () {
      console.log('socket to notification channel connected from app.vue')
    },
  },

  computed: {
    ...mapState(['snackbars'])
  },

  mutations: {

  },

  actions: {

  }
};
</script>
