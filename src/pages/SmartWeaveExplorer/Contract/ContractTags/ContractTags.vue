<template>
  <div class="tags-container">
    <div class="mt-6">
      <p class="json-header">Contract tags:</p>
    </div>
    <json-viewer :value="contractTags" :expand-depth="2" copyable sort theme="json-theme"></json-viewer>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer';

export default {
  name: 'ContractTags',
  components: {
    JsonViewer,
  },
  props: { contractTags: Array },
};
</script>
