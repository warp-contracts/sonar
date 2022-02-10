import Vue from 'vue';
import Router from 'vue-router';

import Layout from '@/components/Layout/Layout';
import ErrorPage from '@/pages/Error/Error';

// Redstone
import Contracts from '@/pages/SmartWeaveExplorer/Contracts/Contracts';
import Contract from '@/pages/SmartWeaveExplorer/Contract/Contract';
import Interaction from '@/pages/SmartWeaveExplorer/Interaction/Interaction';

// Store
import store from './store';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/error',
      name: 'Error',
      component: ErrorPage,
    },

    {
      path: '/app',
      name: 'Layout',
      component: Layout,
      children: [
        {
          path: 'contracts',
          name: 'Contracts',
          component: Contracts,
          meta: {
            showSearchInputInNavbar: true,
          },
        },
        {
          path: 'contract/:id',
          name: 'Contract',
          props: true,
          component: Contract,
          meta: {
            showSearchInputInNavbar: true,
          },
        },
        {
          path: 'interaction/:id',
          name: 'Interaction',
          props: true,
          component: Interaction,
          meta: {
            showSearchInputInNavbar: true,
          },
        },
      ],
    },
  ],
  scrollBehavior: () => {
    document.getElementsByClassName('sing-dashboard')[0].scrollIntoView();
  },
});

router.beforeEach((to, from, next) => {
  if (to.meta.showSearchInputInNavbar) {
    store.dispatch('layout/setSearchInputVisibilityInHeader', true);
  } else {
    store.dispatch('layout/setSearchInputVisibilityInHeader', false);
  }
  next();
});

export default router;
