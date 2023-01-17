<template>
  <div class="settings">
    <div class="settings-icon" @click="toggleMenu">
      <img src="../../assets/icons/gear.svg" alt="settings icon" v-b-tooltip.hover title="Open wallet settings" />
    </div>
    <div class="settings-menu" v-if="menuVisible">
      <button class="refresh" @click="refreshWallet">Refresh</button>
      <button class="disconnect" @click="disconnectWallet">Disconnect</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WalletSettings',

  data() {
    return {
      menuVisible: false,
    };
  },
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    refreshWallet() {
      this.$store.dispatch('getTokenBalance');
    },
    disconnectWallet() {
      this.$store.commit('deleteAccount');
    },
  },
};
</script>

<style scoped lang="scss">
$warp-blue: #5982f1;

.settings {
  position: absolute;
  right: 0;
  top: -1rem;
  .settings-icon {
    position: relative;
    cursor: pointer;
    img {
      width: 2.2rem;
      height: 2.2rem;
      filter: invert(45%) sepia(80%) saturate(2104%) hue-rotate(207deg) brightness(99%) contrast(91%);
    }
  }
  .settings-menu {
    position: absolute;
    left: -5rem;
    bottom: -4rem;
    width: 7rem;

    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

    display: flex;
    flex-direction: column;

    button {
      border: none;
      background-color: white;
      height: 2rem;
      width: 100%;
      font-size: 0.8rem;
      color: $warp-blue;
      text-align: start;

      &:hover {
        background-color: rgba(0, 0, 0, 0.075);
      }
    }
  }
}
</style>
