import Vue from 'vue';
import Vuex from 'vuex';
import webpage_definitions from './webpages';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    webpages: []
  },

  getters: {
    ...webpage_definitions.getters
  },

  mutations: {
    ...webpage_definitions.mutations
  },

  actions: {
    ...webpage_definitions.actions
  }
});