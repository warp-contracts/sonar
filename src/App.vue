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
      currentGateway = 'testnet';
    } else {
      currentGateway = 'mainnet';
    }
    this.setIsTestnet(currentGateway);
    this.setGatewayUrl();
    this.initArweave();
    this.prefetchAll();
  },
  methods: {
    ...mapActions('prefetch', ['setIsTestnet', 'prefetchAll', 'initArweave', 'initArweaveTest', 'setGatewayUrl']),
  },
};
</script>

<style src="./styles/theme.scss" lang="scss" />
