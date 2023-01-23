<template>
  <button>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',

  props: {
    type: {
      type: String,
      default: 'primary',
    },
  },
  data() {
    return {};
  },

  computed: {},
  methods: {
    disconnectWallet() {
      this.$store.commit('deleteAccount');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/mixins';

$warp-blue: #5982f1;
$white: #ffffff;
$radius: 50rem;

button {
  @include flex-center;
  .primary {
    background-color: $warp-blue;
    border-radius: $radius;
    color: $white;

    &:hover {
      opacity: 0.75;
    }
  }

  .secondary {
    background: none;
    border: 1px solid $warp-blue;
    border-radius: $radius;
    color: $warp-blue;

    transition: background 0.2s ease;

    &:hover {
      background-color: $warp-blue;
      color: $white;
    }
  }

  .textOnly {
    background: none;
    color: $warp-blue;

    &:hover {
      opacity: 0.75;
    }
  }
}
</style>
