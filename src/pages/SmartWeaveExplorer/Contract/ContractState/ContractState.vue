<template>
  <div>
    <div class="state-loading" v-if="!state">
      Loading Contract State...
    </div>

    <json-viewer v-if="state"
                 :value="state.state"
                 :expand-depth="2"
                 copyable
                 sort>
    </json-viewer>

    <json-viewer v-if="state"
                 :value="state.validity"
                 :expand-depth="2"
                 copyable
                 sort>
    </json-viewer>

  </div>
</template>

<script>

import JsonViewer from "vue-json-viewer";

export default {
  name: 'ContractState',

  props: {
    contractId: String,
  },

  data() {
    return {
      state: null,
    };
  },

  async created() {
    fetch(`https://cache.redstone.tools/cache/state/${this.contractId}`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.state = data;
        });
  },

  components: { JsonViewer },
};
</script>

<style>
.state-loading {
  height: 600px;
}
</style>
