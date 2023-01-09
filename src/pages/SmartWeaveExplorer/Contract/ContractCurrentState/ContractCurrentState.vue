<template>
  <div>
    <div class="state-container" v-if="!loaded">Loading Contract State...</div>

    <div v-if="state">
      <p class="json-header">{{ header }}</p>
      <div class="json-display">
        <json-viewer theme="json-theme" v-if="state" :value="state" :expand-depth="1" copyable sort>
          <template v-slot:copy>
            <img
              src="@/assets/icons/copy-to-clipboard.svg"
              class="jviewer-copy-icon"
              alt="copy icon"
              v-b-tooltip.hover
              title="Copy JSON data"
            />
          </template>
        </json-viewer>
        <ExportButton
          v-b-tooltip.hover
          title="Download JSON data"
          :exportData="state"
          :fileName="'current-state'"
          :fileType="'application/json'"
        ></ExportButton>
      </div>
    </div>

    <div v-if="state" class="dreData-wrapper json-display">
      <p class="json-header d-flex flex-column">
        Details

        <a
          v-if="state"
          target="_blank"
          :href="`https://dre-1.warp.cc/contract?id=${contractId}&validity=true&errorMessages=true&events=true`"
          >Raw details from evaluator node</a
        >
      </p>
      <json-viewer theme="json-theme" :value="dreData" :expand-depth="1" copyable sort>
        <template v-slot:copy>
          <img
            v-b-tooltip.hover
            title="Copy JSON data"
            src="@/assets/icons/copy-to-clipboard.svg"
            class="jviewer-copy-icon"
            alt="copy icon"
          /> </template
      ></json-viewer>
    </div>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer';
import { mapState } from 'vuex';
import ExportButton from '../../../../components/ExportButton.vue';

export default {
  name: 'ContractCurrentState',

  props: {
    contractId: String,
    currentState: Object,
    sortKey: String,
    timestamp: String,
    signature: String,
    stateHash: String,
    manifest: Object,
  },

  data() {
    return {
      dreData: {
        timestamp: this.timestamp,
        signature: this.signature,
        stateHash: this.stateHash,
        manifest: this.manifest,
      },
      state: null,
      loaded: true,
      header: null,
    };
  },

  async mounted() {
    await this.created();
  },
  methods: {
    async created() {
      this.header = 'Contract Current State';
      if (this.sortKey) {
        this.currentState.sortKey = this.sortKey;
      }

      this.state = this.currentState;
    },
  },

  components: { JsonViewer, ExportButton },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'isTestnet']),
  },
};
</script>

<style lang="scss" scoped>
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

.dreData-wrapper {
  margin: 1rem 0;
}
</style>
