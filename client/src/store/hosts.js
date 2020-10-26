import Axios from 'axios';

export default {
  getters: {
    HOSTS : (state) => {
      return state.hosts;
    }
  },

  mutations: {
    SET_HOST: (state, payload) => {
      state.hosts = payload;
    },

    ADD_HOST: (state, payload) => {
      if (payload == undefined) { return; }

      state.hosts.push(payload);
    }
  },

  actions: {
    SET_HOST: async (ctx, payload) => {
      console.log("tricking the linter", payload);
      let { data } = await Axios.get('http://localhost:3000/hosts');
      ctx.commit("SET_HOST", data);
    },
    ADD_HOST: (ctx, payload) => {
      ctx.commit("ADD_HOST", payload);
    }
  },
};