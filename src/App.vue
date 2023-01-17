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
<style lang="scss">
div.contract-wrapper,
div.charts-wrapper {
  position: relative;
}
.jviewer-copy-icon {
  width: 1.2rem;
  filter: invert(42%) sepia(84%) saturate(1521%) hue-rotate(207deg) brightness(101%) contrast(89%);

  &:hover {
    opacity: 0.85;
  }
}

.json-display {
  position: relative;
}

span.badge-info {
  background-color: var(--warp-blue-color) !important;
}
</style>
