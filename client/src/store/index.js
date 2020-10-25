import Vue from 'vue';
import Vuex from 'vuex';
import host_definitions from './hosts';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    hosts: []
  },

  getters: {
    ...host_definitions.getters
  },

  mutations: {
    ...host_definitions.mutations
  },

  actions: {
    ...host_definitions.actions
  }
});