// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import BootstrapVue, { BIconChevronCompactDown } from 'bootstrap-vue';
import VueLoaders from 'vue-loaders';
import VueTimers from 'vue-timers';
import { ObserveVisibility } from 'vue-observe-visibility';
import Clipboard from 'v-clipboard';
import 'vue-loaders/dist/vue-loaders.css';
import VueTouch from 'vue-touch';
import Toasted from 'vue-toasted';
import CodeDiff from 'v-code-diff';

import store from './store';
import router from './Routes';
import App from './App';
import layoutMixin from './mixins/layout';

Vue.use(BootstrapVue, {
  breakpoints: [`xs`, 'sm', 'md', 'lg', 'xl', 'xxl'],
});
Vue.component('BIconChevronCompactDown', BIconChevronCompactDown);
Vue.mixin(layoutMixin);
Vue.use(VueLoaders);
Vue.use(VueTimers);
Vue.use(Clipboard);
Vue.use(VueTouch);
Vue.use(Toasted);
Vue.use(CodeDiff);

Vue.config.productionTip = false;

Vue.directive('observe-visibility', ObserveVisibility);

Vue.prototype.$vueEventBus = new Vue();

function setupFilters() {
  Vue.filter('tx', function (value) {
    if (!value) return '';
    return value.substr(0, 6) + '...' + value.substr(value.length - 6);
  });
}

setupFilters();

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: (h) => h(App),
});

function addPlus(value, show) {
  return show && value > 0 ? '+' : '';
}
