<template>
  <div>
    <div class="state-container" v-if="!loaded">Loading Contract State...</div>

    <div v-if="state">
      <p class="json-header">{{ header }}</p>
      <div class="json-display">
        <json-viewer theme="json-theme" v-if="state" :value="state" :expand-depth="1" copyable sort>
          <template v-slot:copy>
            <img src="@/assets/icons/copy-to-clipboard.svg" class="jviewer-copy-icon" alt="copy icon" />
          </template>
        </json-viewer>
        <ExportButton :exportData="state" :fileName="'current-state'" :fileType="'text/plain'"></ExportButton>
      </div>
    </div>

    <div class="dreData-wrapper json-display">
      <p class="json-header">Details</p>
      <json-viewer theme="json-theme" :value="dreData" :expand-depth="1" copyable sort>
        <template v-slot:copy>
          <img src="@/assets/icons/copy-to-clipboard.svg" class="jviewer-copy-icon" alt="copy icon" /> </template
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

  mounted() {
    this.created();
  },
  methods: {
    async created() {
      this.header = 'Contract Current State';
      this.currentState.sortKey = this.sortKey;
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
details {
  margin-top: 2rem;
  width: 100%;
  h3 {
    font-size: 1.2rem;
    font-weight: 400;
    margin: 0;
  }
}
svg {
  transition: 0.2s;
}
details[open] svg {
  transform: rotate(180deg);
  transition: 0.2s;
}
summary {
  display: flex;
  flex-direction: row;
  cursor: pointer;
  justify-content: space-between;
  list-style-type: none;
  padding: 1rem 2rem;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}
summary::webkit-details-marker {
  display: none;
}

.dreData-wrapper {
  margin: 1rem 0;
}
</style>
