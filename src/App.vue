<template>
  <router-view />
</template>

<script>
import { mapActions } from 'vuex';
import constants from '@/constants';

export default {
  name: 'App',

  beforeMount() {
    let currentGateway;
    const currentPath = this.$router.history.current.path;

    if (currentPath === '/' || currentPath === '/app') {
      this.$router.push('/app/contracts');
    }
    if (this.$route.query.network === 'testnet') {
      currentGateway = constants.gatewayTestUrl;
    } else {
      currentGateway = constants.gatewayProdUrl;
    }
    console.log(currentGateway);
    this.loadGateway(currentGateway);
    this.initArweave();
    this.prefetchAll();
  },
  methods: {
    ...mapActions('prefetch', ['loadGateway', 'prefetchAll', 'initArweave']),
  },
};
</script>

<style src="./styles/theme.scss" lang="scss" />
