export default {
  namespaced: true,
  state: {
    selectedContractType: 'all',
    selectedSourceType: 'all',
  },
  mutations: {
    setSelectedContractType(state, payload) {
      state.selectedContractType = payload;
    },
    setSelectedSourceType(state, payload) {
      state.selectedSourceType = payload;
    },
  },
  actions: {},
};
