<template>
  <div class="container">
    <ul class="statuses">
      <p class="text-center">
        Select node which will serve as a
        <a href="https://docs.warp.cc/docs/dre/overview" target="_blank">contract state evaluator</a>.
      </p>
      <li
        class="status my-1"
        v-for="(value, key) in status[this.network]"
        :key="key"
        @click="changeDre(value, key)"
        :class="key == activeDreName ? 'selected' : ''"
      >
        <div :class="key == activeDreName ? 'flaticon-check' : 'empty'" class="ml-5"></div>
        <div class="led m-4" :class="value.isActive ? 'led-green' : 'led-red'"></div>
        <div>
          <p class="my-0 status-text">
            <a :href="value.link" @click.stop="goToDre(key)">{{
              key.substring(0, 3).toUpperCase() + '-' + key.substring(3).toUpperCase()
            }}</a>
          </p>
          <p class="mb-0 sdk-text">Warp Contracts: {{ value.warp || 'N/A' }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'DreStatus',
  components: {},
  data() {
    return {};
  },

  computed: {
    ...mapState('drestatus', ['status', 'activeDre']),
    ...mapState('prefetch', ['network']),
    activeDreName() {
      return this.activeDre[this.network].dre;
    },
  },
  methods: {
    changeDre(value, key) {
      const activeDreData = {
        network: this.network,
        dre: key,
        isActive: value.isActive,
        link: `https://dre-${key.substring(3)}.warp.cc`,
      };
      this.$emit('changeActiveDre', activeDreData);
      this.$vueEventBus.$emit('changeActiveDre', activeDreData);
    },
    goToDre(dre) {
      window.open(`https://dre-${dre.substring(3)}.warp.cc`, '_blank');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/mixins';
$warp-blue-filter: invert(45%) sepia(80%) saturate(2104%) hue-rotate(207deg) brightness(99%) contrast(91%);
.container {
  width: 26rem;
  padding: 1rem;

  position: fixed;
  z-index: 999;
  top: 60px;
  right: 133px;

  border-radius: 10px;
  @include glass-effect;

  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;

  .statuses {
    width: 100%;
    .status {
      display: flex;
      align-items: center;

      .status-text {
        font-size: 0.9rem;
        font-weight: 600;

        a {
          z-index: 999;
          color: inherit;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .sdk-text {
        font-size: 0.9rem;
        font-weight: 400;
      }

      &:hover {
        background-color: rgba(211, 211, 211, 0.5);
        cursor: pointer;
      }

      &.selected {
        background-color: rgba(211, 211, 211, 0.5);
      }
    }
  }

  .empty {
    width: 12px;
    height: 12px;
  }
}
</style>
