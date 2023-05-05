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
            <div class="no-result list-group shadow vbt-autcomplete-list" v-if="noResultsInfo">
              <span>{{ noResultsInfo }}</span>
            </div>
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
      <b-button class="btn btn-modal-outline rounded-pill login-btn outline-primary mr-1" @click="toggleDreModal">
        <div class="d-flex align-items-center justify-content-space-between">
          <div class="led mr-3" :class="activeDre.isActive == false ? 'led-red' : 'led-green'"></div>
          <p>{{ activeDre.dre.substring(0, 3).toUpperCase() + '-' + activeDre.dre.substring(3) }}</p>
        </div>
      </b-button>
      <b-button @click="showModal" :class="{ accNavActive: modalVisible }" class="btn btn-modal rounded-pill login-btn">
        <div v-if="walletAccount">
          <p><img src="../../assets/icons/wallet-svgrepo-com.svg" alt="" />{{ walletAccount | tx }}</p>
        </div>
        <p v-else>Login</p>
      </b-button>
    </b-nav>
    <DreStatus v-if="dreModalVisible" :activeDre="activeDre" @changeActiveDre="updateDre"></DreStatus>
    <AccountNavigation v-if="modalVisible"></AccountNavigation>
    <div class="nav-closing" v-if="modalVisible || dreModalVisible" @click="toggleAccNav"></div>
  </b-navbar>
</template>

<script>
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap';
import _ from 'lodash';
import { mapState, mapActions, mapMutations } from 'vuex';
import { debounce } from 'lodash/function';
import constants from '@/constants';
import AccountNavigation from '../AccountNavigation/AccountNavigation.vue';
import DreStatus from '../DreStatus/DreStatus.vue';

export default {
  name: 'Header',
  components: {
    VueTypeaheadBootstrap,
    AccountNavigation,
    DreStatus,
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
      noResultsInfo: null,
      dreModalVisible: false,
      dre1Payload: {
        dre: 'dre1',
        link: 'https://dre-1.warp.cc/status',
      },
      dre2Payload: {
        dre: 'dre2',
        link: 'https://dre-2.warp.cc/status',
      },
      dre3Payload: {
        dre: 'dre3',
        link: 'https://dre-3.warp.cc/status',
      },
      dre4Payload: {
        dre: 'dre4',
        link: 'https://dre-4.warp.cc/status',
      },
      dre5Payload: {
        dre: 'dre5',
        link: 'https://dre-5.warp.cc/status',
      },
    };
  },
  async mounted() {
    this.switchNetworkText = this.isTestnet ? 'Switch to Mainnet' : 'Switch to Testnet';
    await this.getNetworkHeight();
    this.checkMetamask();
    this.clearNoResultInfo();
    this.checkDreStatus(this.dre1Payload);
    this.checkDreStatus(this.dre2Payload);
    this.checkDreStatus(this.dre3Payload);
    this.checkDreStatus(this.dre4Payload);
    this.checkDreStatus(this.dre5Payload);
  },

  computed: {
    ...mapState('drestatus', ['status', 'activeDre']),
    ...mapState('prefetch', ['gatewayUrl', 'arweave', 'isTestnet']),
    ...mapState('layout', ['showSearchInputInHeader']),
    ...mapState('wallet', ['walletAccount', 'modalVisible']),

    searchBarText() {
      return screen.width >= 1024 ? 'Search PST, Contracts, Interactions, Sources...' : 'Search...';
    },
    logoUrl() {
      return this.isTestnet ? '/#/app/contracts?network=testnet' : '/';
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

    ...mapActions('drestatus', ['checkDreStatus', 'changeActiveDre']),

    ...mapActions('wallet', ['getTokenBalance']),
    ...mapMutations('wallet', ['setAccount', 'closeModalVisible', 'showModal']),
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
      this.noResultsInfo = null;
      if (this.query?.length < 3) {
        this.searching = false;
        this.foundContracts = [];
        return;
      }
      fetch(`${this.gatewayUrl}/gateway/search/${this.query}${this.isTestnet ? '?testnet=true' : ''}`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.length == 0) {
            this.noResultsInfo = 'No results found. Try a different query';
          }
          this.foundContracts = data;
          this.searching = false;
        });
    }, 500),
    toggleAccNav() {
      this.closeModalVisible();
      this.dreModalVisible = false;
    },
    toggleDreModal() {
      this.dreModalVisible = !this.dreModalVisible;
    },
    async checkMetamask() {
      const wallet = localStorage.getItem('walletId');
      if (wallet !== null) {
        this.setAccount(wallet);
        this.getTokenBalance();
      }
    },
    clearNoResultInfo() {
      const inputSearch = document.querySelector('[role="searchbox"]');
      inputSearch.addEventListener('blur', (event) => {
        this.noResultsInfo = null;
      });
    },
    updateDre(dre) {
      this.changeActiveDre(dre);

      setTimeout(() => {
        this.dreModalVisible = false;
      }, 1000);
    },
  },
};
</script>

<style src="./Header.scss" lang="scss"></style>

<style scoped lang="scss">
.login-btn {
  cursor: pointer;
  p {
    margin: 0;
  }
  div {
    p {
      display: flex;
      align-items: center;
      margin: 0;
    }
    img {
      filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%);
      width: 2.2rem;
      height: 1.8rem;
      margin-right: 0.5rem;
    }
  }
}
.accNavActive {
  opacity: 0.85 !important;
}
.nav-closing {
  background: transparent;
  position: fixed;
  z-index: 998;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.no-result {
  position: absolute;
  top: 100%;
  height: 4rem;
  width: 100%;

  display: flex;
  justify-content: center;

  background-color: white;
  padding: 0.5rem;
}

@media (max-width: 768px) {
  .login-btn {
    display: none;
  }
}

@media (max-width: 1023px) {
  .no-result {
    left: 0;
    width: 100vw;
  }
}
</style>
