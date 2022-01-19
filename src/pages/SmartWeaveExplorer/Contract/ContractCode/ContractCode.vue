<template>
  <div class="code-container" v-on:message="onMessage">
    <div v-if="!loaded" class="state-container">
      Loading Contract Code...
    </div>
    <iframe
      v-on:load="onReadyStateChange"
      id="arcode"
      title="ArCode iframe"
      width="100%"
      height="100%"
      frameBorder="0"
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
    loaded: false,
  },

  data() {
    return {};
  },
  watch: {
    contractId: function() {
      console.log(this.contractId);
    },
  },
  methods: {
    onReadyStateChange() {
      this.loaded = true;
    },
    onMessage() {
      this.loaded = true;
    },
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
  width: 100%;
}
</style>
