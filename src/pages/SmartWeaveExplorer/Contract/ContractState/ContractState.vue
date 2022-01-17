<template>
  <div>
    <div class="state-container" v-if="!state.data">
      Loading Contract State...
    </div>

    <div v-if="state.ok && state.data">
      <p class="json-header">Contract state:</p>
      <json-viewer
        v-if="state.data.state"
        :value="state.data?.state"
        :expand-depth="1"
        copyable
        sort
      >
      </json-viewer>
      <hr />
      <p class="json-header">Interactions validity:</p>
      <json-viewer
        v-if="state.data.validity"
        :value="state.data?.validity"
        :expand-depth="1"
        copyable
        sort
      >
      </json-viewer>
    </div>
    <div v-if="!state.ok && state.data" class="state-container">
      {{ state.data }}
    </div>
  </div>
</template>

<script>
import JsonViewer from "vue-json-viewer";

export default {
  name: "ContractState",

  props: {
    contractId: String,
  },

  data() {
    return {
      state: { ok: null, data: null },
    };
  },

  mounted() {
    this.created();
  },
  methods: {
    async created() {
      fetch(`https://cache.redstone.tools/cache/state/${this.contractId}`)
        .then((response) => {
          if (response.status == 404) {
            this.state.ok = false;
            return response.text();
          } else if (response.status == 200) {
            this.state.ok = true;
            return response.json();
          } else {
            return response.json();
          }
        })
        .then((data) => {
          this.state.data = data;
        });
    },
  },

  components: { JsonViewer },
};
</script>

<style>
.state-container {
  height: 600px;
}

.json-header {
  overflow: hidden;
  padding: 20px 20px 10px 20px;
  background: white;
  margin-bottom: -10px;
  font-size: 15px;
  color: #6b6b6b;
  font-weight: 500;
}
</style>
