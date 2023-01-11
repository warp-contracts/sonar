<template>
  <div class="acc-nav-container" :class="[loading ? 'justify-content-center' : '', account ? 'acc-nav-big' : '']">
    <div class="unauthorized-view" v-if="!account">
      <div class="buttons-container" v-if="!loading">
        <p>Choose wallet</p>
        <b-button @click="handleMetamask" class="btn btn-modal rounded-pill"
          ><div><img src="../../assets/icons/MetaMask_Fox.svg" alt="metamask logo icon" /></div>
          Metamask</b-button
        >
        <b-button class="btn btn-modal rounded-pill"
          ><div><img src="../../assets/icons/arweave-ar-logo.svg" alt="arweave logo icon" /></div>
          Arweave.app</b-button
        >
      </div>
      <LoadingSpinner v-else></LoadingSpinner>
    </div>
  </div>
</template>

<script>
import MetaMaskOnboarding from '@metamask/onboarding';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
export default {
  name: 'AccountNavigation',
  components: {
    LoadingSpinner,
  },
  props: {},
  data() {
    return {
      account: null,
      loading: false,
    };
  },
  // mounted() {
  //   this.checkMetamask();
  // },
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
      this.account = accounts[0];
      // let successToast = this.$toasted.show('Authenticated!', {
      //   theme: 'outline',
      //   position: 'top-left',
      //   duration: 3000,
      // });
      if (this.account) {
        await this.getTokenBalances();
      }
      this.loading = false;
    },
    // checkMetamask() {
    //   if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
    //     this.isMetamask = false;
    //   } else {
    //     this.isMetamask = true;
    //   }
    // },

    async getTokenBalances() {
      const response = await fetch(`https://contracts.warp.cc/balances?walletAddress=${this.account}&page=${1}`);

      const data = await response.json();
      console.log(data);

    },
  },
};
</script>

<style lang="scss" scoped>
$warp-blue: #5982f1;
.acc-nav-container {
  height: 15rem;
  width: 24rem;
  padding: 1rem;

  position: fixed;
  z-index: 999;
  top: 60px;
  right: 54px;

  display: flex;
  flex-direction: column;
  align-items: center;

  // glass effect
  background: rgba(89, 130, 241, 0.63);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5.6px);
  -webkit-backdrop-filter: blur(5.6px);
  border: 1px solid rgba(89, 130, 241, 0.05);

  transition: transform 0.8s ease;
  transform-origin: right top;
  .unauthorized-view {
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;

    .buttons-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 80%;
      p {
        color: white;
        font-size: 1.2rem;
        margin: 0 auto;
      }
      button {
        display: flex;
        justify-content: center;
        align-items: center;
        div {
          width: 32px;
          height: 32px;
          margin-right: 0.6rem;

          img {
            object-fit: cover;
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
}
.acc-nav-big {
  transform: scale(1.4, 2.2);
  // animation: navScale 1s ease;
  // transform-origin: right top;
}

// @keyframes navScale {
//   0% {
//     transform: scale(1);
//   }

//   100% {
//     transform: scale(1.2, 1.6);
//   }
// }
</style>
