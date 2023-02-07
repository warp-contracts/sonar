import Vue from 'vue';
import Vuex from 'vuex';

import layout from './layout';
import prefetch from './prefetch';
import wallet from './wallet';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    layout,
    prefetch,
    wallet,
  },
});
