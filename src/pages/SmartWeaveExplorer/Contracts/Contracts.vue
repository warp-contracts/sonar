<template>
  <div>
    <div class="contracts-wrapper d-lg-flex" style="marginBottom: 30px;">
      <div :key="gatewayUrl" class="d-none d-md-block pl-5 pl-xl-0 chart">
        <div v-if="!loading" class="chart-title">Interactions</div>
        <v-chart :option="option" :loading="loading" resize="width: 75%; height: 500px" />
      </div>
      <div class="stats-wrapper">
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
              <span v-if="data.item.pst_ticker" class="pl-3"
                >{{ data.item.pst_ticker }}<span v-if="data.item.pst_name"> ({{ data.item.pst_name }})</span></span
              >
              <div
                class="flaticon-copy-to-clipboard"
                v-clipboard="data.item.contractId"
                v-clipboard:success="() => onCopy(data.item.contractId)"
                title="Copy to clipboard"
              ></div>
              <p
                class="clipboard-success"
                v-bind:class="{
                  hidden: !copiedDisplay.includes(data.item.contractId),
                  visible: copiedDisplay.includes(data.item.contractId),
                }"
              >
                Copied
              </p>
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
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import VChart, { LOADING_OPTIONS_KEY } from 'vue-echarts';
import dayjs from 'dayjs';
import { mapState } from 'vuex';
import constants from '@/constants';

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  DataZoomComponent,
]);
export default {
  name: 'Contracts',
  provide: {
    [LOADING_OPTIONS_KEY]: {
      text: '',
      color: '#5982f1',
      textColor: '#000',
      maskColor: 'rgba(255, 255, 255, 0)',
      showSpinner: true,
    },
  },
  data() {
    return {
      selected: 'all',
      selectedSource: 'all',
      chartLoading: true,
      loading: true,
      option: {
        tooltip: {
          trigger: 'axis',
          position: function(pt) {
            return [pt[0], '10%'];
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
          min: 0,
          max: null,
        },
        dataZoom: [
          {
            type: 'slider',
            start: '',
            end: '',
            dataBackground: {
              lineStyle: {
                color: '#5982f1',
              },
              areaStyle: {
                color: '#5982f1',
                shadowColor: '#5982f1',
                opacity: 0.2,
              },
            },
          },
          {
            start: '',
            end: '',
          },
        ],
        series: [
          {
            name: 'Interactions',
            type: 'line',
            data: [],
            lineStyle: { color: '#5982f1' },
          },
        ],
      },
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
      copiedDisplay: [],
    };
  },

  mounted() {
    this.currentPage = this.$route.query.page ? this.$route.query.page : 1;
    this.getContracts(this.$route.query.page ? this.$route.query.page : this.currentPage);
    this.loadStats();
  },
  components: { TxList, VChart },
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
        for (const options of fetchedData.data) {
          if (!options.date) {
            continue;
          }
          this.option.xAxis.data.push(dayjs(options.date).format('DD-MM-YYYY'));
          this.option.series[0].data.push(options.per_day);
        }
        const end = 100;
        const totalTime =
          new Date(fetchedData.data[this.option.xAxis.data.length - 1].date).getTime() -
          new Date(fetchedData.data[0].date).getTime();
        const start = 100 - (2592000000 / totalTime) * 100;
        this.option.dataZoom[0].start = start;
        this.option.dataZoom[0].end = end;
        this.option.dataZoom[1].start = start;
        this.option.dataZoom[1].end = end;
        this.loading = false;
      });
    },
    loadStats() {
      this.loading = true;
      this.option.xAxis.data = [];
      this.option.series[0].data = [];
      this.option.yAxis.max = this.gatewayUrl == constants.gatewayProdUrl ? 2500 : 150;
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
      this.contracts = [];
      axios
        .get(
          `${this.gatewayUrl}/gateway/contracts?limit=${this.limit}&page=${page}${
            type != null ? `&contractType=${type}` : ''
          }${sourceType != null ? `&sourceType=${sourceType}` : ''}`
        )

        .then(async (fetchedContracts) => {
          this.noContractsDetected = fetchedContracts.data.contracts.length == 0;
          this.paging = fetchedContracts.data.paging;
          for (const contract of fetchedContracts.data.contracts) {
            this.contracts.push({
              pst_ticker: contract.pst_ticker,
              pst_name: contract.pst_name,
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
    onCopy(contractId) {
      this.copiedDisplay.push(contractId);
      setTimeout(() => this.copiedDisplay.splice(this.copiedDisplay.indexOf(contractId), 1), 2000);
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
