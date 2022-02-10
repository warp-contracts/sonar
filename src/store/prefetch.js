import constants from '@/constants';
import Arweave from 'arweave';
import {
  ContractDefinitionLoader,
  SmartWeaveWebFactory,
} from 'redstone-smartweave';

export default {
  namespaced: true,
  state: {
    arweave: null,
    smartweave: null,
    gatewayUrl: null,
    switchText: null,
    isTestnet: null,
  },
  mutations: {
    setArweave(state, arweave) {
      if (!state.arweave) {
        state.arweave = arweave;
      }
    },
    setSmartweave(state, client) {
      state.smartweave = client;
    },
    setGatewayUrl(state, gatewayUrl) {
      state.gatewayUrl = gatewayUrl;
    },
    setIsTestnet(state, isTestnet) {
      state.isTestnet = isTestnet;
    },
  },
  getters: {},
  actions: {
    loadGateway({ commit }, payload) {
      commit('setGatewayUrl', payload);
      commit('setIsTestnet', payload == constants.gatewayTestUrl);
    },
    async prefetchAll({ dispatch }) {
      dispatch('initArweave').then(() => {
        dispatch('smartweave');
      });
    },
    initArweave({ commit }) {
      const arweaveObject = Arweave.init({
        host: constants.arweaveUrl,
        protocol: 'https',
        port: 443,
      });

      commit('setArweave', arweaveObject);
    },
    smartweave({ commit, state }) {
      const arweave = state.arweave;
      const contractDefinitionLoader = new ContractDefinitionLoader(
        state.arweave
      );

      const smartweave = SmartWeaveWebFactory.memCachedBased(arweave)
        .setDefinitionLoader(contractDefinitionLoader)
        .build();

      commit('setSmartweave', smartweave);
    },
  },
};
