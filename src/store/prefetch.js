import constants from '@/constants';
import Arweave from 'arweave';
import { WarpWebFactory } from 'warp-contracts';

export default {
  namespaced: true,
  state: {
    arweave: null,
    warp: null,
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
    setWarp(state, client) {
      state.warp = client;
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
    setGatewayUrl({ commit }) {
      commit('setGatewayUrl', constants.gatewayProdUrl);
    },
    setIsTestnet({ commit }, payload) {
      commit('setIsTestnet', payload == 'testnet');
    },
    async prefetchAll({ dispatch }) {
      dispatch('initArweave').then(() => {
        dispatch('warp');
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
    warp({ commit, state }) {
      const arweave = state.arweave;

      const warp = WarpWebFactory.memCachedBased(arweave).build();

      commit('setWarp', warp);
    },
  },
};
