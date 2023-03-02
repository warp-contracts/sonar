export default {
  namespaced: true,
  state: {
    source: null,
  },
  mutations: {
    setSource(state, payload) {
      state.source = payload;
    },
  },
  actions: {},
};
