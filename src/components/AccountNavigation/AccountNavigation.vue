<template>
  <div class="acc-nav-container" :class="[loading ? 'justify-content-center' : '', account ? 'acc-nav-big' : '']">
    <Transition name="slide-fade">
      <WalletConnected v-if="account" :account="account" :tokens="tokens"></WalletConnected>
      <WalletDisconnected
        v-else
        :loading="loading"
        @handleMetamask="handleMetamask"
        @handleArweaveapp="handleArweaveapp"
      ></WalletDisconnected>
    </Transition>
  </div>
</template>

<script>
import MetaMaskOnboarding from '@metamask/onboarding';
import { ArweaveWebWallet } from 'arweave-wallet-connector';
import WalletConnected from './WalletConnected.vue';
import WalletDisconnected from './WalletDisconnected.vue';
export default {
  name: 'AccountNavigation',
  components: {
    WalletConnected,
    WalletDisconnected,
  },
  props: {},
  data() {
    return {
      loading: false,
      fields: ['name', 'balance'],
    };
  },

  computed: {
    account() {
      return this.$store.state.walletAccount;
    },
    tokens() {
      return this.$store.state.walletTokens;
    },
  },
  methods: {
    async handleMetamask() {
      if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
        let failToast = this.$toasted.show('Metamask not detected!', {
          theme: 'outline',
          position: 'top-left',
          duration: 3000,
        });
        return;
      }
      this.loading = true;
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletId = accounts[0];
      this.setWallet(walletId);
      this.getTokenBalance();
      this.loading = false;
    },

    async handleArweaveapp() {
      this.loading = true;
      const wallet = new ArweaveWebWallet();
      wallet.setUrl('arweave.app');
      await wallet.connect();
      const walletId = wallet.namespaces.arweaveWallet.getActiveAddress();
      await this.setWallet(walletId);
      this.getTokenBalance();
      this.loading = false;
      wallet.disconnect();
    },

    async getTokenBalance() {
      this.$store.dispatch('getTokenBalance');
    },
    async setWallet(walletId) {
      this.$store.commit('setAccount', walletId);
      localStorage.setItem('walletId', walletId);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/mixins';
$warp-blue-filter: invert(45%) sepia(80%) saturate(2104%) hue-rotate(207deg) brightness(99%) contrast(91%);
.acc-nav-container {
  height: 36rem;
  width: 32rem;
  padding: 1rem;

  position: fixed;
  z-index: 999;
  top: 60px;
  right: 40px;

  @include flex-center;
  flex-direction: column;

  border-radius: 10px;
  @include glass-effect;

  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
}

.slide-fade-enter-active {
  transition: all 0.2s ease;
}
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
  position: absolute;
}

@media (min-width: 0) and (max-width: 500px) {
  .acc-nav-container {
    right: 10px;
  }
}

@media (max-width: 460px) {
  .acc-nav-container {
    width: 26rem;
  }
}

@media (max-width: 375px) {
  .acc-nav-container {
    width: 22rem;
  }
}
</style>
