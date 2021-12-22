<template>
  <b-navbar class="header d-print-none app-header">
    <b-nav>
      <div class="logo-container">
        <a href="/">
          <div class="logo-image-container">
            <img
                class="logo-image first"
                src="/smartweave-logo.svg"
            />
          </div>
        </a>
      </div>
    </b-nav>
    <b-nav>
      <b-nav-item>
        <a class="fs-lg d-md-none" href="#" @click="toggleSidebarMenu">
          <i class="fi flaticon-menu"/>
        </a>
      </b-nav-item>
    </b-nav>
    <b-nav class="w-25 w-md-auto">
      <b-form class="ml-1" inline>
        <b-form-group style="margin-bottom: 0">
          <b-input-group
              v-if="showSearchInputInHeader"
              class="input-group-no-border"
          >
            <template v-slot:prepend>
              <b-input-group-text
              ><i class="fi flaticon-search-2"
              /></b-input-group-text>
            </template>

            <vue-typeahead-bootstrap
                v-model="query"
                :ieCloseFix="false"
                :data="foundContracts"
                :serializer="item => item.contract_id"
                @hit="goToContract"
                @input="lookupContracts"
                placeholder="Search Contracts"
            />

          </b-input-group>
          <a href="javascript:window.history.back()" v-else>
            <i class="fa flaticon-chevron-back"/>
          </a>
        </b-form-group>
      </b-form>
    </b-nav>
  </b-navbar>
</template>

<script>
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap';
import _ from 'lodash';
import {mapState, mapActions} from 'vuex';
import {debounce} from "lodash/function";

export default {
  name: 'Header',
  components: {
    VueTypeaheadBootstrap
  },
  data() {
    return {
      query: '',
      search: this.$route.query.search,
      selectedContract: null,
      foundContracts: []
    };
  },
  computed: {
    ...mapState('layout', [
      'sidebarClose',
      'sidebarStatic',
      'showSearchInputInHeader',
    ]),

    searchTerm: {
      get() {
        return this.$store.state.layout.searchTerm;
      },
      set(value) {
        this.updateSearchTerm(value);

        if (value) {
          this.$router.push({
            query: {
              ...this.$route.query,
              search: value,
            },
          });
        } else {
          const queryWithoutSearchInput = _.omit(this.$route.query, [
            'search',
          ]);
          this.$router.push({query: queryWithoutSearchInput});
        }
      },
    },
  },

  created() {
    this.updateSearchTerm(this.$route.query.search);
  },

  methods: {
    ...mapActions('layout', [
      'toggleSidebar',
      'switchSidebar',
      'changeSidebarActive',
      'updateSearchTerm',
    ]),
    toggleSidebarMenu() {
      this.toggleSidebar();
    },
    goToContract(data) {
      this.$router.push(`/app/contract/${data.contract_id}`);
      this.foundContracts = [];
      this.query = '';
    },
    lookupContracts: debounce(function () {
      if (this.query?.length < 3) {
        this.foundContracts = [];
        return;
      }
      fetch(`https://gateway.redstone.finance/gateway/contracts/search/${this.query}`)
          .then(response => {
            return response.json();
          })
          .then(data => {
            this.foundContracts = data;
          })
    }, 500)
  },
};
</script>

<style src="./Header.scss" lang="scss"></style>
