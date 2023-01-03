<template>
  <div class="export-link" @click="exportToFile">
    <img src="../assets/icons/download.svg" class="jviewer-download-icon" alt="" />
  </div>
</template>

<script>
import { downloadFile } from '@/utils.js/';

export default {
  name: 'ExportButton',
  props: {
    exportData: {
      type: [String, Number, Object, Array, null],
      required: true,
    },
    fileName: {
      type: String,
      default: 'json-data',
    },
    fileType: {
      type: String,
      default: 'application/json',
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: absolute;
  top: 0.6rem;
  right: 4rem;

  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }

  p {
    margin: 0;
  }

  .jviewer-download-icon {
    width: 1.2rem;
  filter: invert(42%) sepia(84%) saturate(1521%) hue-rotate(207deg) brightness(101%) contrast(89%);

  &:hover {
    opacity: 0.85;
  }
  }
}
</style>
