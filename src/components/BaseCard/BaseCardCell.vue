<template>
  <div class="cell">
    <div class="cell-header">{{ header }}</div>
    <div v-if="value">{{ value }}</div>
    <div v-else><p>N/A</p></div>
  </div>
</template>

<script>
export default {
  name: 'BaseCardCell',
  props: {
    header: String,
    value: [String, Number],
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
