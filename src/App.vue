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
    this.setWarpGateway();
  },
  methods: {
    ...mapActions('prefetch', [
      'setIsTestnet',
      'prefetchAll',
      'initArweave',
      'initArweaveTest',
      'setGatewayUrl',
      'setWarpGateway',
    ]),
  },
};
</script>

<style src="./styles/theme.scss" lang="scss" />
<style lang="scss">
@import './styles/app.scss';
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

.btn-modal {
  height: fit-content;
  border: none;
  margin-right: 10px;
  font-size: $font-size-mini;
  color: white;
  background-color: var(--warp-blue-color) !important;

  &:hover {
    opacity: 0.85;
  }

  @media (min-width: breakpoint-min(md)) {
    font-size: $font-size-base;
  }
}

.contract-tabs {
  overflow-x: auto;
}
</style>
