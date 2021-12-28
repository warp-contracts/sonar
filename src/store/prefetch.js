const axios = require("axios");
import constants from "@/constants";
import Arweave from "arweave";
import {
  CacheableStateEvaluator,
  ContractDefinitionLoader,
  SmartWeaveWebFactory,
} from "redstone-smartweave";
import LocalStorageCache from "@/cache/cache";
import LocalStorageBlockHeightCache from "@/cache/block-height-cache";
import Vue from "vue";

export default {
  namespaced: true,
  state: {
    arweave: null,
    smartweave: null,
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
  },
  getters: {},
  actions: {
    async prefetchAll({ dispatch }) {
      dispatch("initArweave").then(() => {
        dispatch("smartweave");
      });
    },
    initArweave({ commit }) {
      const arweaveObject = Arweave.init({
        host: constants.arweaveUrl,
        protocol: "https",
        port: 443,
      });

      commit("setArweave", arweaveObject);
    },
    smartweave({ commit, state }) {
      const arweave = state.arweave;
      const contractDefinitionLoader = new ContractDefinitionLoader(
        state.arweave
      );

      const smartweave = SmartWeaveWebFactory.memCachedBased(arweave)
        .setDefinitionLoader(contractDefinitionLoader)
        .build();

      commit("setSmartweave", smartweave);
    },
  },
};
