<template>
  <div class="export-link"><p @click="exportToFile">Export</p></div>
</template>

<script>
import { downloadFile } from '@/utils.js/';

export default {
  name: 'ExportButton',
  props: {
    exportData: {
      type: [String, Number, Object, Array],
      required: true,
    },
    fileName: {
      type: String,
      default: 'json-data',
    },
    fileType: {
      type: String,
      default: 'text/plain',
    },
  },
  data() {
    return {};
  },
  methods: {
    exportToFile() {
      downloadFile(this.exportData, this.fileName, this.fileType);
    },
  },
};
</script>

<style lang="scss" scoped>
.export-link {
  position: absolute;
  bottom: 0.5rem;
  right: 1rem;
  color: var(--warp-blue-color);
  text-decoration: underline;
  cursor: pointer;

  p {
    margin: 0;
  }
}
</style>
