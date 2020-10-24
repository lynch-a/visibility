import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    hosts: []
  },
  
  getters : {
    HOSTS : (state) => {
      console.log("host getter ", state.hosts);
      return state.hosts;
    }
  },

  mutations: {
    SET_HOST: (state, payload) => {
      state.hosts = payload;
    },

    ADD_HOST: (state, payload) => {
      console.log("hit store mutation", payload);
      //state.screenshots = payload;
      /*
      state.hosts = state.hosts.map((host) => {
        if (host.url != payload.ur) return;
        
        host.img = payload.img;
        return host;
      });
      */
      if (payload == undefined) { return; }

      state.hosts.push(payload);
    }
  },

  actions: {
    SET_HOST: async (ctx, payload) => {
      console.log("tricking the linter", payload);
      console.log("hit store action");
      let { data } = await Axios.get('http://localhost:3000/hosts');
      console.log("AXIOS: " + data);
      ctx.commit("SET_HOST", data);
    },
    ADD_HOST: (ctx, payload) => {
      ctx.commit("ADD_HOST", payload);
    }
  },
})
