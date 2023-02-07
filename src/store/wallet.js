export default {
  namespaced: true,
  state: {
    modalVisible: false,
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
      state.modalVisible = false;
      localStorage.removeItem('walletId');
    },
    switchWallet(state) {
      state.walletAccount = null;
    },
    changeModalVisible(state) {
      state.modalVisible = !state.modalVisible;
    },
  },
  actions: {
    async getTokenBalance({ state, commit }) {
      state.tableLoading = true;
      const response = await fetch(`https://contracts.warp.cc/balances?walletAddress=jnioZFibZSCcV8o-HkBXYPYEYNib4tqfexP0kCBXX_M`);

      const data = await response.json();
      commit('setTokens', data.balances);
      state.tableLoading = false;
    },
  },
};
