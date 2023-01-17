import Vue from 'vue';
import Vuex from 'vuex';

import layout from './layout';
import prefetch from './prefetch';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    walletAccount: null,
    walletTokens: null,
    tableLoading: false,
  },
  mutations: {
    setAccount(state, payload) {
      state.walletAccount = payload;
    },
    setTokens(state, payload) {
      state.walletTokens = payload;
    },
    deleteAccount(state) {
      state.walletAccount = null;
      localStorage.removeItem('walletId');
    },
  },
  actions: {
    async getTokenBalance({ state, commit }) {
      // const response = await fetch(
      //   `https://contracts.warp.cc/balances?walletAddress=${state.walletAccount}&page=${currentPage}`
      // );
      state.tableLoading = true;

      const response = await fetch(
        `https://contracts.warp.cc/balances?walletAddress=FAxDUPlFfJrLDl6BvUlPw3EJOEEeg6WQbhiWidU7ueY`
      );

      const data = await response.json();
      commit('setTokens', data.balances);
      state.tableLoading = false;
    },
  },
  modules: {
    layout,
    prefetch,
  },
});
