<template>
  <div class="unauthorized-view">
    <div class="buttons-container" v-if="!loading">
      <p class="nav-header">Choose wallet</p>
      <b-button @click="$emit('handleMetamask')" class="btn btn-modal rounded-pill"
        ><div><img src="../../assets/icons/MetaMask_Fox.svg" alt="metamask logo icon" /></div>
        Metamask</b-button
      >
      <b-button @click="$emit('handleArweaveapp')" class="btn btn-modal rounded-pill"
        ><div><img src="../../assets/icons/arweave-ar-logo.svg" alt="arweave logo icon" /></div>
        Arweave.app</b-button
      >
      <p class="nav-subtext">Connect wallet to display your token balance</p>
    </div>
    <LoadingSpinner v-else></LoadingSpinner>
  </div>
</template>

<script>
import LoadingSpinner from '../../components/LoadingSpinner.vue';
export default {
  name: 'WalletDisconnected',
  components: {
    LoadingSpinner,
  },
  props: ['loading'],
  data() {
    return {};
  },
};
</script>

<style scoped lang="scss">
@import '../../styles/mixins';

.unauthorized-view {
  width: 100%;

  @include flex-center;
  flex-direction: column;

  .buttons-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 80%;
    p.nav-header {
      font-size: 1.2rem;
      margin: 0 auto;
    }

    button {
      @include flex-center;
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
</style>
