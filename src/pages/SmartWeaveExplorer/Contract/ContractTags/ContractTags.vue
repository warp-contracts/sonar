<template>
  <div class="tags-container">
    <div v-if="contractTags?.length > 0" class="mt-6">
      <p class="json-header">Contract tags:</p>
    </div>
    <json-viewer
      v-if="contractTags?.length > 0"
      :value="contractTags"
      :expand-depth="2"
      copyable
      sort
      theme="json-theme"
    ></json-viewer>
    <p v-else>Tags are unavailable for this contract</p>
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
