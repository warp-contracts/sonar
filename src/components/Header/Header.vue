<template>
  <b-navbar class="header d-print-none app-header">
    <b-nav>
      <div class="logo-container align-self-center">
        <a :href="logoUrl">
          <div class="logo-image-container">
            <img class="d-none d-md-block logo-image first" src="/warp-logo-full.svg" style="width: 120px" />
            <img class="d-block d-md-none logo-image first" src="/warp-logo-mobile.svg" style="width: 32px" />
          </div>
        </a>
      </div>
    </b-nav>
    <b-nav class="w-25 w-md-auto">
      <b-form class="ml-1" inline>
        <b-form-group style="margin-bottom: 0">
          <b-input-group v-if="showSearchInputInHeader" class="input-group-no-border" style="paddingleft: 10px">
            <template v-slot:prepend>
              <b-input-group-text v-if="!searching"><i class="fi flaticon-search-2" /></b-input-group-text>
              <b-input-group-text v-if="searching" class="blue"
                ><b-spinner style="width: 20px; height: 20px" label="Busy"></b-spinner>
              </b-input-group-text>
            </template>

            <vue-typeahead-bootstrap
              v-model="query"
              :ieCloseFix="false"
              :data="foundContracts"
              :serializer="
                (item) =>
                  item.type == 'pst'
                    ? item.pst_ticker.substring(0, 3).toLowerCase() == query.substring(0, 3).toLowerCase()
                      ? item.pst_ticker
                      : item.pst_name
                    : item.id
              "
              @hit="goToContract"
              @input="lookupContracts"
              :placeholder="searchBarText"
              :maxMatches="1000"
              class="input-search"
            >
              <template slot="suggestion" slot-scope="{ data, htmlText }">
                <div class="d-block d-md-flex justify-content-between">
                  <span v-if="data.type == 'pst'" class="d-none d-md-block text-left">{{ data.id }}</span>
                  <span class="suggestion-type d-block d-md-none">{{ data.type }}</span>
                  <span v-if="data.type == 'pst'" class="text-nowrap pst-match" v-html="htmlText"></span>
                  <span v-else class="text-nowrap" v-html="htmlText"></span>
                  <span v-if="data.type == 'pst'" class="d-block d-md-none text-nowrap text-left">{{ data.id }}</span>
                  <div style="width: 12%">
                    <span class="d-none d-md-block suggestion-type mt-1">{{ data.type }}</span>
                  </div>
                </div>
              </template>
            </vue-typeahead-bootstrap>
          </b-input-group>
          <a href="javascript:window.history.back()" v-else>
            <i class="fa flaticon-chevron-back" />
          </a>
        </b-form-group>
      </b-form>
    </b-nav>
    <b-nav></b-nav>
    <b-nav class="align-items-center flex-grow-1 justify-content-end">
      <div class="d-none d-md-flex align-items-center">
        <div class="text-uppercase">
          <div class="d-flex flex-column p-1">
            <span>height</span>
          </div>
        </div>
        <span class="pr-5 pl-2 height">{{ networkHeight }}</span>
      </div>

      <div class="text-uppercase mr-4 switch-link" role="button" @click="toggleGateway">
        {{ switchNetworkText }}
      </div>

      <b-button class="btn btn-modal rounded-pill" v-b-modal.modal-1>{{ findMoreText }}</b-button>
      <b-modal id="modal-1" title="Redstone SmartWeave Gateway" size="lg">
        <Modal />
        <template #modal-footer><div></div></template>
      </b-modal>
    </b-nav>
  </b-navbar>
</template>

<script>
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap';
import _ from 'lodash';
import { mapState, mapActions } from 'vuex';
import { debounce } from 'lodash/function';
import Modal from '@/components/Modal/Modal';
import constants from '@/constants';

export default {
  name: 'Header',
  components: {
    VueTypeaheadBootstrap,
    Modal,
  },
  data() {
    return {
      query: '',
      search: this.$route.query.search,
      selectedContract: null,
      foundContracts: [],
      searching: false,
      switchNetworkText: null,
      networkHeight: null,
    };
  },
  async mounted() {
    this.switchNetworkText = this.isTestnet ? 'Switch to Mainnet' : 'Switch to Testnet';
    await this.getNetworkHeight();
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'arweave', 'isTestnet']),
    ...mapState('layout', ['showSearchInputInHeader']),
    searchBarText() {
      return screen.width >= 1024 ? 'Search PST, Contracts, Interactions, Sources...' : 'Search...';
    },
    logoUrl() {
      return this.isTestnet ? '/#/app/contracts?network=testnet' : '/';
    },
    findMoreText() {
      return screen.width >= 768 ? 'Find out more' : 'More';
    },
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
          const queryWithoutSearchInput = _.omit(this.$route.query, ['search']);
          this.$router.push({ query: queryWithoutSearchInput });
        }
      },
    },
  },

  created() {
    this.updateSearchTerm(this.$route.query.search);
  },
  methods: {
    ...mapActions('layout', ['updateSearchTerm']),
    ...mapActions('prefetch', ['setIsTestnet']),
    async toggleGateway() {
      if (!this.isTestnet) {
        this.setIsTestnet('testnet');
        this.switchNetworkText = 'Switch to Mainnet';
        this.$router.push('/app/contracts?network=testnet');
      } else {
        this.setIsTestnet('mainnet');
        this.switchNetworkText = 'Switch to Testnet';
        this.$router.push('/app/contracts');
      }
    },
    async getNetworkHeight() {
      const info = await this.arweave.network.getInfo();
      this.networkHeight = info.height;
    },
    goToContract(data) {
      if (data.type == 'contract' || data.type == 'pst') {
        this.$router.push(`/app/contract/${data.id}${this.isTestnet ? '?network=testnet' : ''}`);
      } else if (data.type == 'interaction') {
        this.$router.push(`/app/interaction/${data.id}${this.isTestnet ? '?network=testnet' : ''}`);
      } else if (data.type === 'creator') {
        this.$router.push(`/app/creator/${data.id}${this.isTestnet ? '?network=testnet' : ''}`);
      } else {
        this.$router.push(`/app/source/${data.id}${this.isTestnet ? '?network=testnet' : ''}`);
      }
      this.foundContracts = [];
      this.query = '';
    },
    lookupContracts: debounce(function () {
      this.searching = true;
      if (this.query?.length < 3) {
        this.searching = false;
        this.foundContracts = [];
        return;
      }
      fetch(`${this.gatewayUrl}/gateway/search/${this.query}`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.foundContracts = data;
          this.searching = false;
        });
    }, 500),
  },
};
</script>

<style src="./Header.scss" lang="scss"></style>
