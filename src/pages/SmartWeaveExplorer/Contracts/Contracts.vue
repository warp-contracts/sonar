<template>
  <div>
    <div class="charts-wrapper ">
      <div class="charts d-none d-md-block">
        <div class=" chart-single-wrapper">
          <div class="chart-header">
            <div>Interactions</div>
            <router-link
              class="d-xl-block d-none"
              :to="{
                path: '/app/stats/interactions',
              }"
              style="marginLeft: auto; cursor: pointer;"
            >
              <div class="flaticon-fullscreen" />
            </router-link>
          </div>
          <Charts :gatewayUrl="gatewayUrl" :statsPerDay="interactionsPerDay" title="Interactions" :fullscreen="false" />
          <div class="d-flex justify-content-center item-text">
            <div>Total:&nbsp;</div>
            <div v-if="totalInteractionsLoaded">
              <div>{{ totalInteractions }}</div>
            </div>
            <div v-else class="align-self-center" style="marginLeft: 47px;">
              <div class="dot-flashing"></div>
            </div>
          </div>
        </div>
        <div class="d-none d-md-block chart-single-wrapper">
          <div class="chart-header">
            <div>Contracts</div>
            <router-link
              class="d-xl-block d-none"
              :to="{
                path: '/app/stats/contracts',
              }"
              style="marginLeft: auto; cursor: pointer;"
            >
              <div class="flaticon-fullscreen" />
            </router-link>
          </div>
          <Charts :gatewayUrl="gatewayUrl" :statsPerDay="contractsPerDay" title="Contracts" :fullscreen="false" />
          <div class="d-flex justify-content-center item-text">
            <div>Total:&nbsp;</div>
            <div v-if="totalContractsLoaded">
              <div>{{ totalContracts }}</div>
            </div>
            <div v-else class="align-self-center" style="marginLeft: 47px;">
              <div class="dot-flashing"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="stats-wrapper d-block d-md-none">
        <div class="item-text">
          <div>Total contracts</div>
          <div class="d-flex justify-content-center">
            <div v-if="totalContractsLoaded">
              <div>{{ totalContracts }}</div>
            </div>
            <div v-else class="align-self-center mt-4">
              <div class="dot-flashing"></div>
            </div>
          </div>
        </div>
        <hr style="width: 50%" />
        <div class="item-text">
          <div>Total interactions</div>
          <div class="d-flex justify-content-center">
            <div v-if="totalInteractionsLoaded">
              <div>{{ totalInteractions }}</div>
            </div>
            <div v-else class="align-self-center mt-4">
              <div class="dot-flashing"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="contracts-wrapper">
      <div class="d-block py-3 d-sm-flex">
        <div class="my-1 d-sm-flex px-0 pr-5">
          <p class="filter-header mr-4 ml-2">Contract Source Type</p>
          <b-form-radio-group
            id="contract-source-type-group"
            name="contract-source-type-group"
            @change="refreshData"
            v-model="selectedSource"
            class="radio-group"
            stacked
          >
            <div class="contract-type-item">
              <b-form-radio value="all">All</b-form-radio>
            </div>
            <div class="contract-type-item">
              <b-form-radio value="application/javascript">JavaScript</b-form-radio>
            </div>
            <div class="contract-type-item">
              <b-form-radio value="application/wasm">WASM</b-form-radio>
            </div>
          </b-form-radio-group>
        </div>
        <div class="my-1 d-sm-flex px-0">
          <p class="filter-header mr-4 ml-2">Contract Type</p>
          <b-form-radio-group
            id="contract-type-group"
            name="contract-type-group"
            @change="refreshData"
            v-model="selected"
            class="radio-group"
            stacked
          >
            <div class="contract-type-item">
              <b-form-radio value="all">All</b-form-radio>
            </div>
            <div class="contract-type-item">
              <b-form-radio value="pst">PST</b-form-radio>
            </div>
            <div class="contract-type-item">
              <b-form-radio value="other">Other</b-form-radio>
            </div>
          </b-form-radio-group>
        </div>
      </div>
      <TxList :paging="pages" @page-clicked="onPageClicked" v-if="!noContractsDetected">
        <b-table
          ref="table"
          id="contracts-table"
          stacked="md"
          hover
          :items="contracts"
          :fields="computedFields"
          @row-clicked="rowClicked"
          :busy="!contractsLoaded"
        >
          <template #table-busy> </template>
          <template #cell(contractId)="data" class="text-right">
            <div class="d-flex">
              <router-link
                :to="{
                  path: '/app/contract/' + data.item.contractId,
                  query: isTestnet ? { network: 'testnet' } : '',
                }"
              >
                {{ data.item.contractId | tx }}
              </router-link>
              <div
                class="flaticon-copy-to-clipboard small"
                v-clipboard="data.item.contractId"
                title="Copy to clipboard"
              ></div>
              <span v-if="data.item.pst_ticker" class="pl-3">{{ data.item.pst_ticker }}</span>
            </div>
          </template>
          <template #cell(owner)="data">
            <a v-if="!isTestnet" :href="`https://viewblock.io/arweave/address/${data.item.blockId}`" target="_blank">
              {{ data.item.owner | tx }}</a
            >
            <span v-else>{{ data.item.owner | tx }}</span>
          </template>

          <template #cell(type)="data">
            <div class="text-uppercase">{{ data.item.type }}</div>
          </template>

          <template #cell(lang)="data">
            <div class="text-uppercase">{{ data.item.lang }}</div>
          </template>

          <template #cell(total)="data">
            <div class="text-right">{{ data.item.total }}</div>
          </template>

          <template #cell(confirmed)="data">
            <div class="text-right">{{ data.item.confirmed }}</div>
          </template>

          <template #cell(corrupted)="data">
            <div class="text-right">{{ data.item.corrupted }}</div>
          </template>

          <template #cell(lastInteractionHeight)="data">
            <div class="text-right">
              {{ data.item.lastInteractionHeight }}
            </div>
          </template>
        </b-table>

        <div v-if="!contractsLoaded">
          <div v-for="n in 15" :key="n" class="preloader text-preloader tx-preloader"></div>
        </div>
      </TxList>
      <div v-else class="no-contracts-wrapper ml-2">
        No contracts for specified requirements!
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import TxList from '@/components/TxList/TxList';
import Charts from '@/components/Charts/Charts';
import { mapState } from 'vuex';

export default {
  name: 'Contracts',
  data() {
    return {
      selected: 'all',
      selectedSource: 'all',
      chartLoading: true,
      loading: true,
      fields: [
        'contractId',
        'owner',
        'type',
        {
          key: 'lang',
          label: 'Wasm Lang',
        },
        {
          key: 'total',
          label: 'total',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
        {
          key: 'confirmed',
          label: 'confirmed',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
        {
          key: 'corrupted',
          label: 'corrupted',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
        {
          key: 'lastInteractionHeight',
          label: 'last interaction height',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
      ],
      contracts: [],
      currentPage: 1,
      paging: null,
      loaded: false,
      limit: 15,
      totalContracts: 0,
      totalInteractions: 0,
      totalContractsLoaded: false,
      totalInteractionsLoaded: false,
      filterList: [
        { value: 'all', label: 'All' },
        { value: 'pst', label: 'PST' },
        { value: 'other', label: 'Other' },
      ],
      noContractsDetected: false,
      axiosSource: null,
      contractsPerDay: null,
      interactionsPerDay: null,
    };
  },
  mounted() {
    this.currentPage = this.$route.query.page ? this.$route.query.page : 1;
    this.getContracts(this.$route.query.page ? this.$route.query.page : this.currentPage);
    this.loadStats();
  },
  components: { TxList, Charts },
  watch: {
    gatewayUrl() {
      this.refreshData();
      this.loadStats();
    },
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'isTestnet']),
    pages() {
      return this.paging ? this.paging : null;
    },
    contractsLoaded() {
      return (
        this.contracts &&
        this.paging &&
        this.contracts.length == (this.paging.items > this.limit ? this.limit : this.paging.items)
      );
    },
    computedFields() {
      return this.selectedSource == 'application/wasm'
        ? this.fields
        : this.fields.filter((field) => field.key != 'lang');
    },
  },
  methods: {
    refreshData() {
      if (this.currentPage > 1) {
        this.$router.push({ query: {} });
      }
      this.currentPage = 1;

      this.getContracts(
        this.currentPage,
        this.selected == 'all' ? null : this.selected,
        this.selectedSource == 'all' ? null : this.selectedSource
      );
    },
    async getStats() {
      axios.get(`${this.gatewayUrl}/gateway/stats`).then((fetchedData) => {
        this.totalContracts = fetchedData.data.total_contracts;
        this.totalInteractions = fetchedData.data.total_interactions;
        this.totalContractsLoaded = true;
        this.totalInteractionsLoaded = true;
      });
    },
    async getStatsPerDay() {
      axios.get(`${this.gatewayUrl}/gateway/stats/per-day`).then((fetchedData) => {
        this.contractsPerDay = fetchedData.data.contracts_per_day;
        this.interactionsPerDay = fetchedData.data.interactions_per_day;
      });
    },
    loadStats() {
      this.getStatsPerDay();
      this.getStats();
    },
    async onPageClicked(pageNumber) {
      this.currentPage = pageNumber;
      this.getContracts(
        this.currentPage,
        this.selected == 'all' ? null : this.selected,
        this.selectedSource == 'all' ? null : this.selectedSource
      );
    },
    async getContracts(page, type, sourceType) {
      if (this.axiosSource) {
        this.axiosSource.cancel('Cancel previous request');
      }
      const CancelToken = axios.CancelToken;
      this.axiosSource = CancelToken.source();

      this.contracts = [];
      axios
        .get(
          `${this.gatewayUrl}/gateway/contracts?limit=${this.limit}&page=${page}${
            type != null ? `&contractType=${type}` : ''
          }${sourceType != null ? `&sourceType=${sourceType}` : ''}`,
          {
            cancelToken: this.axiosSource.token,
          }
        )

        .then(async (fetchedContracts) => {
          this.noContractsDetected = fetchedContracts.data.contracts.length == 0;
          this.paging = fetchedContracts.data.paging;
          for (const contract of fetchedContracts.data.contracts) {
            this.contracts.push({
              pst_ticker: contract.pst_ticker,
              id: contract.contract,
              contractId: contract.contract,
              owner: contract.owner,
              total: contract.interactions,
              confirmed: contract.confirmed,
              corrupted: contract.corrupted,
              lastInteractionHeight: contract.last_interaction_height,
              type: contract.contract_type,
              lang: contract.src_wasm_lang,
            });
          }
        });
    },
    rowClicked(record) {
      this.$set(record, '_showDetails', !record._showDetails);
    },
    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '');
    },
  },
};
</script>

<style src="./Contracts.scss" lang="scss" scoped></style>
