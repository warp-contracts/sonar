export default {
  namespaced: true,
  state: {
    activeDre: {
      mainnet: {
        dre: 'dre1',
        link: 'https://dre-1.warp.cc',
        isActive: false,
      },
      testnet: {
        dre: 'dre1',
        link: 'https://dre-1.warp.cc',
        isActive: false,
      },
      devnet: {
        dre: 'dreDev',
        link: 'https://dre-dev.warp.cc',
        isActive: false,
      },
    },
    status: {
      mainnet: {
        dre1: {
          isActive: false,
          warp: null,
          link: 'https://dre-1.warp.cc/status',
        },
        dre2: {
          isActive: false,
          warp: null,
          link: 'https://dre-2.warp.cc/status',
        },
        dre3: {
          isActive: false,
          warp: null,
          link: 'https://dre-3.warp.cc/status',
        },
        dre4: {
          isActive: false,
          warp: null,
          link: 'https://dre-4.warp.cc/status',
        },
        dre5: {
          isActive: false,
          warp: null,
          link: 'https://dre-5.warp.cc/status',
        },
        dre6: {
          isActive: false,
          warp: null,
          link: 'https://dre-6.warp.cc/status',
        },
      },
      testnet: {
        dre1: {
          isActive: false,
          warp: null,
          link: 'https://dre-1.warp.cc/status',
        },
        dre2: {
          isActive: false,
          warp: null,
          link: 'https://dre-2.warp.cc/status',
        },
        dre3: {
          isActive: false,
          warp: null,
          link: 'https://dre-3.warp.cc/status',
        },
        dre4: {
          isActive: false,
          warp: null,
          link: 'https://dre-4.warp.cc/status',
        },
        dre5: {
          isActive: false,
          warp: null,
          link: 'https://dre-5.warp.cc/status',
        },
        dre6: {
          isActive: false,
          warp: null,
          link: 'https://dre-6.warp.cc/status',
        },
      },
      devnet: {
        dreDev: {
          isActive: false,
          warp: null,
          link: 'https://dre-dev.warp.cc/status',
        },
      },
    },
  },
  mutations: {
    updateStatus(state, payload) {
      state.status[payload.network][payload.dre].isActive = true;
      state.status[payload.network][payload.dre].warp = payload.warp;
      if (payload.dre == state.activeDre[payload.network].dre) {
        state.activeDre[payload.network].isActive = true;
      }
    },
    updateActiveDre(state, payload) {
      const { network, ...activeDre } = payload;
      state.activeDre[network] = activeDre;
    },
  },
  actions: {
    async checkDreStatus({ commit, state }, payload) {
      Object.keys(state.status[payload]).forEach(async (k) => {
        try {
          const response = await fetch(state.status[payload][k].link);
          const data = await response.json().then((res) => res);
          commit('updateStatus', { dre: k, warp: data.manifest.warpSdkConfig['warp-contracts'], network: payload });
        } catch (e) {
          if (k == state.activeDre[payload].dre) {
            state.activeDre[payload].isActive = false;
          }
        }
      });
    },
    changeActiveDre({ commit, state }, payload) {
      commit('updateActiveDre', payload);
      localStorage.setItem('activeDre', JSON.stringify(payload));
    },
    setActiveDre({ commit, state }, payload) {
      commit('updateActiveDre', { ...payload, isActive: false });
    },
  },
};
