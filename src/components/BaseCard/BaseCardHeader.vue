<template>
  <div class="d-block d-md-flex pl-3">
    <div class="contract-header-wrapper">
      <div class="flaticon-file-signature m-0-auto"></div>
      <div class="align-self-end contract-header">
        <span>{{ cardTitle }}</span>
      </div>
    </div>
    <div class="align-self-end pl-md-3 pl-5 contract-id d-flex">
      <span class="d-none d-sm-block">{{ id }}</span
      ><span class="d-block d-sm-none">{{ id | tx }}</span>
      <div
        class="flaticon-copy-to-clipboard"
        v-clipboard="contractId"
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

  inject: ['id', 'cardTitle'],
  data() {
    return {};
  },
};
</script>

<style scoped lang="scss"></style>
