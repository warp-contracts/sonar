export default {
  namespaced: true,
  state: {
    activeDre: {
      dre: 'dre1',
      link: 'https://dre-1.warp.cc',
      isActive: false,
    },
    status: {
      dre1: {
        isActive: false,
        warp: null,
      },
      dre2: {
        isActive: false,
        warp: null,
      },
      dre3: {
        isActive: false,
        warp: null,
      },
      dre4: {
        isActive: false,
        warp: null,
      },
      dre5: {
        isActive: false,
        warp: null,
      },
    },
  },
  mutations: {
    updateStatus(state, payload) {
      state.status[payload.dre].isActive = true;
      state.status[payload.dre].warp = payload.warp;
      if (payload.dre == state.activeDre.dre) {
        state.activeDre.isActive = true;
      }
    },
    updateActiveDre(state, payload) {
      state.activeDre = payload;
    },
  },
  actions: {
    async checkDreStatus({ commit, state }, payload) {
      try {
        const response = await fetch(payload.link);
        const data = await response.json().then((res) => res);
        commit('updateStatus', { dre: payload.dre, warp: data.manifest.warpSdkConfig['warp-contracts'] });
      } catch (e) {
        if (payload.dre == state.activeDre.dre) {
          state.activeDre.isActive = false;
        }
      }
    },
    changeActiveDre({ commit, state }, payload) {
      commit('updateActiveDre', payload);
      localStorage.setItem('activeDre', JSON.stringify(payload));
    },
    setActiveDre({ commit, state }, payload) {
      commit('updateActiveDre', payload);
    },
  },
};
