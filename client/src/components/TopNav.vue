<template>
  <div>
    <v-app-bar color="deep-purple accent-4" dense dark>
      <v-toolbar-title>Visibility</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-app-bar-nav-icon @click="drawer = true" class="hidden-sm-and-up"></v-app-bar-nav-icon>

      <!-- big screen navigations -->
      <v-toolbar-items class="hidden-xs-only">
        <v-btn v-for="item in items" :to="item.link" :key="item.key" text>
          <v-icon small left>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <!-- Small screen navigation-->
    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-list nav dense>
        <v-list-item-group
          v-model="group"
          active-class="deep-purple--text text--accent-4"
        >
          <v-list-item v-for="item in items" v-bind:key="item.title" v-bind:to="item.link">
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>

        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        drawer: false,
        group: null,
        items: [
          { title: "Home", link: "/", icon: "mdi-home" },
          { title: "Screenshots", link: "/screenshots", icon: "mdi-monitor-screenshot" }
        ]
      }
    }
  }
</script>