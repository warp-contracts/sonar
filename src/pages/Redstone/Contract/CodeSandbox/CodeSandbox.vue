<template>
  <div>
    <div v-if="!iframeData">Loading Contract Data...</div>

    <div v-else>
      <iframe title="test" v-bind="iframeData"/>
    </div>
  </div>
</template>

<script>
import {createCodesandbox} from "./createCodesandbox";

export default {
  name: 'CodeSandbox',

  props: {
    contractId: String
  },

  data() {
    return {
      iframeData: null
    };
  },

  async mounted() {
    this.iframeData = await createCodesandbox(this.contractId);
  },

  created() {
  },

  components: {},
  computed: {},
  methods: {},
};
</script>

<style src="./CodeSandbox.scss" lang="scss" scoped/>
