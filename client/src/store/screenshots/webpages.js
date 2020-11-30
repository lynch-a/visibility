import Axios from 'axios';

export default {
  getters: {
    WEBPAGES : (state) => {
      return state.webpages;
    }
  },

  mutations: {
    SET_WEBPAGE: (state, payload) => {
      console.log("is it setting");
      state.webpages = payload;
    },

    ADD_WEBPAGE: (state, payload) => {
      if (payload == undefined) { return; }

      console.log("payload", payload);

      const webpage = payload["webpage"];
      const snapshot = payload["snapshot"];
      
      state.webpages.webpages[webpage.id] = webpage;

      if (state.webpages.webpages[webpage.id].snapshots == null) { // this is a new webpage
        state.webpages.webpages[webpage.id].snapshots = [snapshot];
        state.total = state.total + 1;
      } else {
        state.webpages.webpages[webpage.id].snapshots.append(snapshot);
      }
    }
  },

  actions: {
    SET_WEBPAGE: async (ctx, payload) => {
      console.log("tricking the linter", payload);

      var page = 0;
      var perpage = 20;

      if (payload !== undefined) {
        if (Object.prototype.hasOwnProperty.call(payload, "page") &&
          Object.prototype.hasOwnProperty.call(payload, "perpage")) {
          page = payload.page;
          perpage = payload.perpage;

          let { data } = await Axios.get('http://localhost:3000/webpages?page='+page+'&perpage='+perpage);
          ctx.commit("SET_WEBPAGE", data);
        } else {
          let { data } = await Axios.get('http://localhost:3000/webpages');
          ctx.commit("SET_WEBPAGE", data);
        }
      } else {
        let { data } = await Axios.get('http://localhost:3000/webpages');
        ctx.commit("SET_WEBPAGE", data);
      }
    },
    ADD_WEBPAGE: (ctx, payload) => {
      ctx.commit("ADD_WEBPAGE", payload);
    }
  },
};