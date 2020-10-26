<template>
  <v-app>
    <TopNav/>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
//import HelloWorld from './components/HelloWorld';
import TopNav from './components/TopNav';

export default {
  name: 'App',

  components: {
    TopNav,
  },

  sockets: {
    "screenshot-taken": function(data) {
      console.log("ss-taken: ", data);
      this.$store.dispatch("ADD_HOST", data);
    },

    connect: function () {
      console.log('socket to notification channel connected from app.vue')
    },
  },

  mutations: {

  },

  actions: {

  }
};
</script>
