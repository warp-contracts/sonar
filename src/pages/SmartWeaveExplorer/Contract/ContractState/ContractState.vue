<template>
  <div>
    <div class="state-container" v-if="!loaded">Loading Contract State...</div>

    <div v-if="state">
      <p class="json-header">{{ header }}</p>

      <div class="json-display">
        <json-viewer theme="json-theme" v-if="state" :value="state" :expand-depth="1" copyable sort>
          <template v-slot:copy>
            <img
              v-b-tooltip.hover
              title="Copy JSON data"
              src="@/assets/icons/copy-to-clipboard.svg"
              class="jviewer-copy-icon"
              alt="copy icon"
            />
          </template>
        </json-viewer>
        <ExportButton
          v-b-tooltip.hover
          title="Download JSON data"
          :exportData="state"
          :fileName="'initial-state'"
          :fileType="'application/json'"
        ></ExportButton>
      </div>
    </div>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer';
import { mapState } from 'vuex';
import ExportButton from '../../../../components/ExportButton.vue';

export default {
  name: 'ContractState',

  props: {
    contractId: String,
    initState: Object,
  },

  data() {
    return {
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
      this.header = 'Contract Initial State';
      this.state = this.initState;
    },
  },

  components: { JsonViewer, ExportButton },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'network']),
  },
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
