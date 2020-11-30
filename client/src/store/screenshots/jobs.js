import Axios from 'axios';
import Vue from 'vue'

export default {
  getters: {
    JOBS : (state) => {
      return state.jobs;
    }
  },

  mutations: {
    SET_JOBS: (state, payload) => {
      state.jobs = payload;
    },

    ADD_JOBS: (state, payload) => {
      if (payload == undefined) { return; }

      console.log("payload", payload);

      const jobs = payload["screenshot_jobs"];
      
      for (let job of Object.keys(jobs)) {
        state.jobs[jobs[job].id] = jobs[job];
      }
    },

    REMOVE_JOB: (state, payload) => {
      if (payload == undefined) { return; }

      Vue.delete(state.jobs, payload["job_id"]);

      console.log("payload", payload);
    },

    FAIL_JOB: (state, payload) => {
      if (payload == undefined) { return; }

      Vue.delete(state.jobs, payload["job_id"]);

      console.log("payload", payload);
    }
  },

  actions: {
    SET_JOBS: async (ctx, payload) => {
      console.log("tricking the linter", payload);

      let { data } = await Axios.get('http://localhost:3000/jobs');
      ctx.commit("SET_JOBS", data);
    },
    ADD_JOBS: (ctx, payload) => {
      ctx.commit("ADD_JOBS", payload);
    },
    REMOVE_JOB: (ctx, payload) => {
      ctx.commit("REMOVE_JOB", payload);
    },
    FAIL_JOB: (ctx, payload) => {
      ctx.commit("REMOVE_JOB", payload);
    },

  },
};