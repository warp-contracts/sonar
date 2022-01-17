<template>
  <div>
    <div class="iframe-loading" v-if="!iframeData">
      Loading Contract Code...
    </div>

    <iframe v-else title="Contract Code" v-bind="iframeData" />
  </div>
</template>

<script>
import { createCodesandbox } from "./createCodesandbox";

export default {
  name: "CodeSandbox",

  props: {
    contractId: String,
  },

  data() {
    return {
      iframeData: null,
    };
  },

  async mounted() {
    this.iframeData = await createCodesandbox(this.contractId);
  },

  created() {},

  components: {},
  computed: {},
  methods: {},
};
</script>

<style>
.iframe-loading {
  height: 600px;
}
</style>
