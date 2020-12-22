import Axios from 'axios';
import Vue from 'vue'

export default {
  getters: {
    WORKERS : (state) => {
      return state.workers;
    },

    TOTAL_SCREENSHOTS_QUEUED: (state) => {
      var total = 0;

      for(let worker of Object.entries(state.workers)) {
        total += worker[1].queued
      }

      return total;
    }
  },

  mutations: {
    SET_WORKERS: (state, payload) => {
      state.workers = payload;
    },

    ADD_WORKERS: (state, payload) => {
      if (payload == undefined) { return; }

      const workers = payload;
      
      for (let worker of Object.keys(workers)) {
        state.workers[worker[worker.id]] = workers[worker];
      }
    },

    REMOVE_WORKER: (state, payload) => {
      if (payload == undefined) { return; }

      Vue.delete(state.workers, payload["worker_id"]);

      console.log("payload", payload);
    },

    UPDATE_WORKER: (state, payload) => {
      if (payload == undefined) { return; }

      let worker_id = payload["worker_id"];
      let worker = payload["worker"];

      console.log("updating worker: ", payload);

      state.workers[worker_id] = worker;
    }
  },

  actions: {
    SET_WORKERS: async (ctx, payload) => {
      console.log("tricking the linter", payload);

      let { data } = await Axios.get('http://localhost:3000/workers');
      ctx.commit("SET_WORKERS", data["workers"]);
    },
    ADD_WORKERS: (ctx, payload) => {
      ctx.commit("ADD_WORKERS", payload);
    },
    REMOVE_WORKER: (ctx, payload) => {
      ctx.commit("REMOVE_WORKER", payload);
    },
    UPDATE_WORKER: (ctx, payload) => {
      ctx.commit("UPDATE_WORKER", payload);
    },
  },
};