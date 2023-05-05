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
    const activeDre = localStorage.getItem('activeDre');
    if (activeDre) {
      this.setActiveDre(JSON.parse(activeDre));
    }
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
    ...mapActions('drestatus', ['setActiveDre']),
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

  &-outline {
    background-color: white;
    border: 0.1em solid var(--warp-blue-color);

    &:hover,
    &:focus,
    &:active {
      color: #5e5e5e !important;
      background-color: white !important;
      border: 0.1em solid var(--warp-blue-color) !important;
    }
  }
}

.contract-tabs {
  overflow-x: auto;
}

.flaticon-check {
  height: 12px;
  width: 12px;
  filter: invert(47%) sepia(86%) saturate(460%) hue-rotate(56deg) brightness(108%) contrast(94%);

  &.centered {
    margin: 0 auto;
  }
}

.flaticon-cross {
  height: 12px;
  width: 12px;
  filter: invert(14%) sepia(48%) saturate(6784%) hue-rotate(338deg) brightness(107%) contrast(97%);

  &.centered {
    margin: 0 auto;
  }
}
</style>
