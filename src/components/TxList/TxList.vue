<template>
  <div class="manifest-list">
    <slot></slot>
    <b-pagination-nav
      :link-gen="linkGen"
      :number-of-pages="rows"
      @page-click="handleClick"
      use-router
      last-number
      first-number
      align="center"
    ></b-pagination-nav>
  </div>
</template>

<script>
export default {
  name: "TxList",
  data() {
    return {
      currentPage: 1,
      perPage: 15,
    };
  },

  props: { paging: { type: Object, default: null } },

  methods: {
    handleClick(event, pageNumber) {
      this.currentPage = pageNumber;
      this.$emit("page-clicked", this.currentPage);
    },
    linkGen(pageNum) {
      return pageNum === 1 ? "?" : `?page=${pageNum}`;
    },
  },

  computed: {
    rows() {
      if (this.paging) {
        return this.paging.pages;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/styles/app";

.custom-select {
  width: min-content;
}

.provider-manifests {
  & > div {
    margin-bottom: 15px;
  }

  .manifestId {
    font-weight: $font-weight-soft-bold;

    &.chosen {
      font-weight: $font-weight-semi-bold;
    }
  }
}

.upload-wrapper {
  position: relative;

  .manifest-upload {
    position: absolute;
  }

  .manifest-input {
    position: absolute;
    opacity: 0;
    z-index: -1;
  }
}

.manifest-status {
  font-size: $font-size-index;
  font-weight: $font-weight-semi-bold;
  color: $white;
  text-transform: uppercase;
  height: 20px;
  border-radius: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 4px;

  &.active {
    background-color: $teal;
  }

  &.mining {
    background-color: $yellow;
  }
}

#message-input,
#locked-hours-input {
  width: 50%;
}

.manifest-btn-wrapper {
  display: flex;
  flex-direction: row-reverse;
}

.manifest-preloader {
  height: 35px;
  margin-bottom: 20px;
  @include preload-animation(2.5s, 100vw);
}
</style>

<style>
.provider-manifests .manifest-list tr:not(.b-table-details) {
  cursor: pointer;
}

.pagination {
  padding-top: 30px;
}
</style>
