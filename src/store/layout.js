export default {
  namespaced: true,
  state: {
    showSearchInputInHeader: false,
    searchTerm: "",
  },
  mutations: {
    handleSwipe(state, e) {
      if ("ontouchstart" in window) {
        if (e.direction === 4) {
          state.showSidebar = true;
        }

        if (e.direction === 2 && state.showSidebar) {
          state.showSidebar = false;
        }
      }
    },
    setSearchInputVisibilityInHeader(state, visibility) {
      state.showSearchInputInHeader = visibility;
    },
    updateSearchTerm(state, searchTerm) {
      state.searchTerm = searchTerm;
    },
  },
  actions: {
    handleSwipe({ commit }, e) {
      commit("handleSwipe", e);
    },
    setSearchInputVisibilityInHeader({ commit }, visibility) {
      commit("setSearchInputVisibilityInHeader", visibility);
    },
    updateSearchTerm({ commit }, searchTerm) {
      commit("updateSearchTerm", searchTerm);
    },
  },
};
