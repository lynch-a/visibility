import Vue from 'vue';
import Vuex from 'vuex';
import webpage_definitions from './screenshots/webpages';
import job_definitions from './screenshots/jobs';
import worker_definitions from './screenshots/workers';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    webpages: {

    },

    jobs: {

    },

    workers: {

    },

    snackbars: []
  },

  getters: {
    ...webpage_definitions.getters,
    ...job_definitions.getters,
    ...worker_definitions.getters
  },

  mutations: {
    ...webpage_definitions.mutations,
    ...job_definitions.mutations,
    ...worker_definitions.mutations,

    SET_SNACKBAR(state, snackbar) {
      state.snackbars = state.snackbars.concat(snackbar);
    }
  },

  actions: {
    ...webpage_definitions.actions,
    ...job_definitions.actions,
    ...worker_definitions.actions,
    setSnackbar({commit}, snackbar) {
      commit('SET_SNACKBAR', snackbar);
    }
  }
});