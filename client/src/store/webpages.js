import Axios from 'axios';

export default {
  getters: {
    WEBPAGES : (state) => {
      return state.webpages;
    }
  },

  mutations: {
    SET_WEBPAGE: (state, payload) => {
      state.webpages = payload;
    },

    ADD_WEBPAGE: (state, payload) => {
      if (payload == undefined) { return; }

      state.webpages.push(payload);
    }
  },

  actions: {
    SET_WEBPAGE: async (ctx, payload) => {
      console.log("tricking the linter", payload);
      let { data } = await Axios.get('http://localhost:3000/webpages');
      ctx.commit("SET_WEBPAGE", data);
    },
    ADD_WEBPAGE: (ctx, payload) => {
      ctx.commit("ADD_WEBPAGE", payload);
    }
  },
};