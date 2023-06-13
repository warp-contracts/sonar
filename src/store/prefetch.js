import constants from '@/constants';
import Arweave from 'arweave';
import { WarpFactory } from 'warp-contracts';

export default {
  namespaced: true,
  state: {
    arweave: null,
    warp: null,
    gatewayUrl: null,
    switchText: null,
    network: null,
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
    setNetwork(state, network) {
      state.network = network;
    },
  },
  getters: {},
  actions: {
    setGatewayUrl({ commit }, payload) {
      commit('setGatewayUrl', payload == 'devnet' ? constants.gatewayDevUrl : constants.gatewayProdUrl);
    },
    setNetwork({ commit }, payload) {
      commit('setNetwork', payload);
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
      const warp = WarpFactory.forMainnet();

      commit('setWarp', warp);
    },
  },
};
