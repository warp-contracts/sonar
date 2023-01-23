<template>
  <button :class="classType" @click="$emit('btnClicked')">
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

  computed: {
    classType() {
      return {
        primary: this.type == 'primary',
        secondary: this.type == 'secondary',
        textOnly: this.type == 'textOnly',
      };
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
  cursor: pointer;
  padding: 0.6rem 1.8rem;

  p {
    margin: 0;
  }
}
.primary {
  background-color: $warp-blue;
  border-radius: $radius;
  color: $white;
  border: none;

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
  border: none;
  background: none;
  color: $warp-blue;

  &:hover {
    opacity: 0.75;
  }
}
</style>
