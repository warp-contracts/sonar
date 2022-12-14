<template>
    <div>
      <div class="state-container" v-if="!loaded">Loading Contract State...</div>
  
      <div v-if="state">
        <p class="json-header">{{ header }}</p>
  
        <json-viewer theme="json-theme" v-if="state" :value="state" :expand-depth="1" copyable sort> </json-viewer>
        <p class="json-header">sortKey</p>
        <json-viewer theme="json-theme" v-if="(state && sortKey)" :value="sortKey" :expand-depth="1" copyable sort> </json-viewer>
      </div>
    </div>
  </template>
  
  <script>
  import JsonViewer from 'vue-json-viewer';
  import { mapState } from 'vuex';
  
  export default {
    name: 'ContractCurrentState',
  
    props: {
      contractId: String,
      currentState: Object,
      sortKey: Object,
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
        this.header = 'Contract Current State';
        this.state = this.currentState;
      },
    },
  
    components: { JsonViewer },
    computed: {
      ...mapState('prefetch', ['gatewayUrl', 'isTestnet']),
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
  