<template>
  <div class="cell">
    <div class="cell-header">{{ header }}</div>
    <div v-if="!isLoaded">
      <div class="pl-3 pt-3">
        <div class="dot-flashing"></div>
      </div>
    </div>
    <div v-if="value && isLoaded">{{ value }}</div>
    <div v-if="!value && isLoaded"><p>N/A</p></div>
  </div>
</template>

<script>
export default {
  name: 'BaseCardCell',
  props: {
    header: String,
    value: [String, Number],
    isLoaded: Boolean,
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.cell-header {
  font-weight: 600;
}
</style>
