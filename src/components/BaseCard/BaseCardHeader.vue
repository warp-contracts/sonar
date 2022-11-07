<template>
  <div :class="[cardTitle === 'Contract' ? 'pl-3' : 'pl-2', 'd-block', 'd-md-flex']">
    <div class="contract-header-wrapper">
      <div :class="[cardTitle === 'Contract' ? 'flaticon-file-signature' : 'flaticon-interaction', 'm-0-auto']"></div>
      <div class="align-self-end contract-header">
        <span>{{ cardTitle }}</span>
      </div>
    </div>
    <div class="align-self-end pl-md-3 pl-5 contract-id d-flex">
      <span class="d-none d-sm-block">{{ id }}</span
      ><span class="d-block d-sm-none">{{ id | tx }}</span>
      <div
        class="flaticon-copy-to-clipboard"
        v-clipboard="this.id"
        v-clipboard:success="onCopy"
        title="Copy to clipboard"
      ></div>
      <p class="clipboard-success" v-bind:class="{ hidden: !copiedDisplay, visible: copiedDisplay }">Copied</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseCardHeader',
  props: {
    id: String,
    cardTitle: String,
  },
  data() {
    return {
      copiedDisplay: false,
    };
  },
  methods: {
    onCopy() {
      this.copiedDisplay = true;
      setTimeout(() => (this.copiedDisplay = false), 2000);
    },
  },
};
</script>

<style src="../../pages/SmartWeaveExplorer/Interaction/Interaction.scss" lang="scss" scoped></style>
<style scoped lang="scss">
.flaticon-file-signature {
  height: 30px;
  width: 30px;
  background-repeat: no-repeat;
  -ms-flex-item-align: end;
  align-self: end;
  -webkit-filter: invert(66%) sepia(0) saturate(275%) hue-rotate(191deg) brightness(95%) contrast(97%);
  filter: invert(66%) sepia(0) saturate(275%) hue-rotate(191deg) brightness(95%) contrast(97%);
}
</style>
