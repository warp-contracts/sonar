import Vue from 'vue';
import Vuex from 'vuex';

import layout from './layout';
import prefetch from './prefetch';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    walletAccount: null,
    walletTokens: null,
  },
  mutations: {
    setAccount(state, payload) {
      state.walletAccount = payload;
    },
    setTokens(state, payload) {
      state.walletTokens = payload;
    },
  },
  actions: {
    async getTokenBalances({commit}) {
      // const response = await fetch(
      //   `https://contracts.warp.cc/balances?walletAddress=${state.walletAccount}&page=${currentPage}`
      // );

      const response = await fetch(
        `https://contracts.warp.cc/balances?walletAddress=FAxDUPlFfJrLDl6BvUlPw3EJOEEeg6WQbhiWidU7ueY`
      );

      const data = await response.json();
      commit('setTokens', data.balances)
    },
  },
  modules: {
    layout,
    prefetch,
  },
});
