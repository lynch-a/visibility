import Vue from 'vue';
import Vuex from 'vuex';
import webpage_definitions from './screenshots/webpages';
import job_definitions from './screenshots/jobs';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    webpages: {},
    jobs: {

    }
  },

  getters: {
    ...webpage_definitions.getters,
    ...job_definitions.getters
  },

  mutations: {
    ...webpage_definitions.mutations,
    ...job_definitions.mutations
  },

  actions: {
    ...webpage_definitions.actions,
    ...job_definitions.actions
  }
});