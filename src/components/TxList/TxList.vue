<template>
  <div class="tx-list">
    <slot></slot>
    <b-pagination-nav
      v-if="paging"
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
import { mapState } from 'vuex';
export default {
  name: 'TxList',
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
      this.$emit('page-clicked', this.currentPage);
    },
    linkGen(pageNum) {
      return pageNum === 1 ? `?network=${this.network}` : `?network=${this.network}&page=${pageNum}`;
    },
  },

  computed: {
    ...mapState('prefetch', ['network']),
    rows() {
      if (this.paging) {
        return this.paging.pages;
      }
    },
  },
};
</script>
<style src="./TxList.scss" lang="scss" />
