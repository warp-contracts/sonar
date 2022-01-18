<template>
  <div class="code-container">
    <iframe
      id="inlineFrameExample"
      title="Inline Frame Example"
      width="100%"
      height="100%"
      :src="getCodeSrc()"
    >
    </iframe>
  </div>
</template>

<script>
export default {
  name: "ContractCode",

  props: {
    contractId: String,
  },

  data() {
    return {};
  },

  mounted() {
    this.created();
  },
  methods: {
    getCodeSrc() {
      return `https://arcode.studio/#/${this.contractId}/${
        window.innerHeight < 768 ? "?hideToolbar=1" : ""
      }`;
    },
  },

  components: {},
};
</script>

<style>
.code-container {
  height: 700px;
}
</style>
