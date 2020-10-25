<template>
  <v-app>
    <div>
      <v-app-bar
        color="deep-purple accent-4"
        dense
        dark
      >
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
  
        <v-toolbar-title>Visibility</v-toolbar-title>
  
        <v-spacer></v-spacer>
  
        <v-btn icon>
          <v-icon>mdi-heart</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-heart</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-heart</v-icon>
        </v-btn>

      </v-app-bar>
    </div>

    <v-main>
      <Scan/>
      <Overview/>
    </v-main>
  </v-app>
</template>

<script>
//import HelloWorld from './components/HelloWorld';
import Overview from './components/Overview';
import Scan from './components/Scan';

export default {
  name: 'App',

  components: {
    //HelloWorld,
    Overview,
    Scan
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
