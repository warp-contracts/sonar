<template>
  <div>
    <div v-if="correct" class="contract-wrapper">
      <TestnetLabel v-if="isTestnet" :isTestnet="isTestnet"></TestnetLabel>
      <div class="d-block d-md-flex pl-3">
        <div class="contract-header-wrapper">
          <div class="flaticon-file-signature m-0-auto"></div>
          <div class="align-self-end contract-header">
            <span>Contract Source</span>
          </div>
        </div>
        <div class="align-self-end pl-md-3 pl-5 contract-id d-flex">
          <span class="d-none d-sm-block">{{ sourceId }}</span
          ><span class="d-block d-sm-none">{{ sourceId | tx }}</span>
          <div
            class="flaticon-copy-to-clipboard"
            v-clipboard="sourceId"
            v-clipboard:success="onCopy"
            title="Copy to clipboard"
          ></div>
          <p class="clipboard-success" v-bind:class="{ hidden: !copiedDisplay, visible: copiedDisplay }">Copied</p>
        </div>
      </div>
      <div class="contract-details-wrapper pb-5">
        <div class="d-block d-md-flex">
          <div class="col-6 p-0">
            <div class="cell">
              <div class="cell-header">Creator</div>
              <div class="d-flex">
                <div v-if="owner" class="align-self-end d-flex">
                  <span class="d-none d-sm-block"
                    ><a :href="`/#/app/creator/${owner}${isTestnet ? '?network=testnet' : ''}`">{{ owner }}</a></span
                  ><span class="d-block d-sm-none"
                    ><a :href="`https://v2.viewblock.io/arweave/address/${owner}`" target="_blank">{{
                      owner | tx
                    }}</a></span
                  >
                  <div
                    class="flaticon-copy-to-clipboard"
                    v-clipboard="owner"
                    v-clipboard:success="onCopyOwner"
                    title="Copy to clipboard"
                  ></div>
                  <p
                    class="clipboard-success"
                    v-bind:class="{
                      hidden: !copiedDisplayOwner,
                      visible: copiedDisplayOwner,
                    }"
                  >
                    Copied
                  </p>
                </div>
                <div v-else>
                  <span>-</span>
                </div>
              </div>
            </div>
            <div class="cell">
              <div class="cell-header">Bundler source transaction id</div>
              <div class="d-flex">
                <div v-if="bundlerSrcTxId" class="align-self-end d-flex">
                  <span class="d-none d-sm-block"
                    ><a :href="`https://v2.viewblock.io/arweave/tx/${bundlerSrcTxId}`" target="_blank">{{
                      bundlerSrcTxId
                    }}</a></span
                  ><span class="d-block d-sm-none"
                    ><a :href="`https://v2.viewblock.io/arweave/tx/${bundlerSrcTxId}`" target="_blank">{{
                      bundlerSrcTxId | tx
                    }}</a></span
                  >
                  <div
                    class="flaticon-copy-to-clipboard"
                    v-clipboard="bundlerSrcTxId"
                    v-clipboard:success="onCopyBundler"
                    title="Copy to clipboard"
                  ></div>
                  <p
                    class="clipboard-success"
                    v-bind:class="{
                      hidden: !copiedDisplayBundler,
                      visible: copiedDisplayBundler,
                    }"
                  >
                    Copied
                  </p>
                </div>
                <div v-else>
                  <div>N/A</div>
                </div>
              </div>
            </div>
            <div class="cell">
              <div class="cell-header">Total contracts</div>
              <div>{{ paging?.total }}</div>
            </div>
          </div>
          <div class="col-6 p-0">
            <div class="cell">
              <div class="cell-header">Source content type</div>
              <div>{{ srcContentType }}</div>
            </div>
            <div class="cell">
              <div class="cell-header">WASM</div>
              <div v-if="wasmLang">{{ wasmLang }}</div>
              <div v-else>N/A</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <b-nav tabs class="contract-tabs" @changed="onInput">
          <b-nav-item
            :to="`${isTestnet ? '?network=testnet' : ''}#`"
            :active="$route.hash === '#' || $route.hash === ''"
            @click="onInput($route.hash)"
          >
            Contracts
          </b-nav-item>
          <b-nav-item
            :to="`${isTestnet ? '?network=testnet' : ''}#code`"
            :active="$route.hash === '#code'"
            @click="onInput($route.hash)"
          >
            Code
          </b-nav-item>
        </b-nav>
        <div class="tab-content">
          <div :class="['tab-pane', { active: $route.hash === '#' || $route.hash === '' }]" class="p-2">
            <div v-if="!noContractsDetected">
              <div>
                <TxList :paging="pages" v-if="contractsLoaded" @page-clicked="onPageClicked">
                  <b-table
                    v-if="contracts?.length > 0"
                    ref="table"
                    id="interactions-table"
                    stacked="md"
                    hover
                    :items="contracts"
                    :fields="fields"
                    @row-clicked="rowClicked"
                    :busy="!contractsLoaded"
                  >
                    <template #table-busy></template>

                    <template #cell(id)="data">
                      <div class="d-flex">
                        <a :href="`/#/app/contract/${data.item.id}${isTestnet ? '?network=testnet' : ''}`">
                          {{ data.item.id | tx }}</a
                        >
                        <div
                          class="flaticon-copy-to-clipboard small"
                          v-clipboard="data.item.id"
                          v-clipboard:success="({ event }) => event.stopPropagation()"
                          title="Copy to clipboard"
                        ></div>
                      </div>
                    </template>

                    <template #cell(bundlerId)="data">
                      <div class="d-flex" v-if="data.item.bundlerId">
                        <a
                          :href="`${
                            daysAgo(data.item.timestamp) > 1
                              ? `https://v2.viewblock.io/arweave/tx/${data.item.bundlerId}`
                              : `https://arweave.net/${data.item.bundlerId}`
                          }`"
                          target="_blank"
                          >{{ data.item.bundlerId | tx }}</a
                        >
                        <div
                          class="flaticon-copy-to-clipboard small"
                          v-clipboard="data.item.bundlerId"
                          v-clipboard:success="({ event }) => event.stopPropagation()"
                          title="Copy to clipboard"
                        ></div>
                      </div>
                      <span v-else>N/A</span>
                    </template>

                    <template #cell(block_height)="data">
                      <div class="text-right">{{ data.item.blockHeight }}</div>
                    </template>

                    <template #cell(ago)="data">
                      <div class="text-right">{{ data.item.ago }}</div>
                    </template>

                    <template #cell(interactions)="data" class="text-right">
                      <div class="text-right">{{ data.item.interactions }}</div>
                    </template>

                    <template #cell(owner)="data">
                      <div class="d-flex">
                        <a
                          v-if="!isTestnet"
                          :href="`https://v2.viewblock.io/arweave/address/${data.item.owner}`"
                          target="_blank"
                        >
                          {{ data.item.owner | tx }}</a
                        >
                        <span v-else> {{ data.item.owner | tx }}</span>
                        <div
                          class="flaticon-copy-to-clipboard small"
                          v-clipboard="data.item.owner"
                          v-clipboard:success="({ event }) => event.stopPropagation()"
                          title="Copy to clipboard"
                        ></div>
                      </div>
                    </template>
                  </b-table>
                </TxList>
                <div v-if="!contractsLoaded">
                  <div v-for="n in 15" :key="n" class="preloader text-preloader tx-preloader"></div>
                </div>
              </div>
            </div>
            <div v-else class="interactions-wrapper">Contract has no interactions!</div>
          </div>
          <div :class="['tab-pane', { active: $route.hash === '#code' }]" class="p-2">
            <div v-if="visitedTabs.includes('#code')">
              <ContractCode v-if="loadedSource" :sourceId="sourceId" :wasm="!!wasmLang"></ContractCode>
            </div>
          </div>
          <div :class="['tab-pane', { active: $route.hash === '#state' }]" class="p-2">
            <div>
              <ContractState v-if="initState" :contractId="contractId" :initState="initState"></ContractState>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!correct">
      <Error />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import TxList from '@/components/TxList/TxList';
import JsonViewer from 'vue-json-viewer';
import ContractCode from '../Contract/ContractCode/ContractCode';
import dayjs from 'dayjs';
import Error from '@/components/Error/Error';
import { mapState } from 'vuex';
import constants from '@/constants';
import TestnetLabel from '../../../components/TestnetLabel.vue';

const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

export default {
  name: 'Source',

  data() {
    return {
      testLoading: false,
      visitedTabs: [],
      epochs: [
        ['year', 31536000],
        ['month', 2592000],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
        ['second', 1],
      ],
      fields: [
        'id',
        'owner',
        'bundlerId',
        'blockHeight',
        'age',
        {
          key: 'interactions',
          label: 'interactions',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
      ],
      contracts: null,
      currentPage: 1,
      paging: null,
      owner: '',
      total: null,
      limit: 15,
      selected: 'all',
      copiedDisplay: false,
      copiedDisplayOwner: false,
      copiedDisplayBundler: false,
      copiedDisplayInteraction: [],
      loadingInitialized: false,
      correct: false,
      pst_ticker: null,
      pst_name: null,
      noContractsDetected: false,
      wasmLang: null,
      initState: null,
      loadedValidity: null,
      loadedSource: null,
      validity: null,
      axiosSource: null,
      sourceTxId: null,
      srcContentType: null,
      loadedContractData: false,
      contractData: null,
      bundlerSrcTxId: null,
    };
  },
  watch: {
    sourceId: function () {
      this.$router.go(0);
    },
  },
  async mounted() {
    if (this.$route.params.id.length != 43) {
      this.correct = false;
    } else {
      this.correct = true;
    }

    await this.getSource();
    await this.getContracts(this.$route.query.page ? this.$route.query.page : this.currentPage);
    this.visitedTabs.push(this.$route.hash);
  },

  components: {
    TxList,
    JsonViewer,
    Error,
    ContractCode,
    TestnetLabel,
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'isTestnet']),
    sourceId() {
      return this.$route.params.id;
    },
    pages() {
      return this.paging ? this.paging : null;
    },
    contractsLoaded() {
      return this.contracts !== null;
    },
  },

  methods: {
    convertTZ(date, tzString) {
      return new Date(
        (typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString })
      );
    },
    getDuration(timeAgoInSeconds) {
      for (let [name, seconds] of this.epochs) {
        const interval = Math.floor(timeAgoInSeconds / seconds);
        if (interval >= 1) {
          return {
            interval: interval,
            epoch: name,
          };
        }
      }
    },
    timeAgo(date) {
      const timeAgoInSeconds = Math.floor(
        (this.convertTZ(new Date(), 'Europe/Berlin') - this.convertTZ(new Date(date), 'Europe/London')) / 1000
      );
      const { interval, epoch } = this.getDuration(timeAgoInSeconds);
      const suffix = interval === 1 ? '' : 's';
      return `${interval} ${epoch}${suffix} ago`;
    },
    daysAgo(timestamp) {
      const difference = Math.trunc(+Date.now() / 1000) - timestamp;
      const daysDifference = Math.floor(difference / 60 / 60 / 24);

      return daysDifference;
    },
    refreshData() {
      this.currentPage = 1;
      this.$router.push({ query: {} });
      this.selected == 'all' ? this.getContracts(this.currentPage) : this.getContracts(this.currentPage, this.selected);
    },
    onCopy() {
      this.copiedDisplay = true;
      setTimeout(() => (this.copiedDisplay = false), 2000);
    },
    onCopyOwner() {
      this.copiedDisplayOwner = true;
      setTimeout(() => (this.copiedDisplayOwner = false), 2000);
    },
    onCopyBundler() {
      this.copiedDisplayBundler = true;
      setTimeout(() => (this.copiedDisplayBundler = false), 2000);
    },
    onInput(value) {
      if (!this.visitedTabs.includes(value)) {
        this.visitedTabs.push(value);
      }
    },
    rowClicked(record) {
      this.$set(record, '_showDetails', !record._showDetails);
    },
    async onPageClicked(pageNumber) {
      this.currentPage = pageNumber;
      if (this.selected == 'all') {
        this.getContracts(this.currentPage);
      } else {
        this.getContracts(this.currentPage, this.selected);
      }
    },
    async getContracts(page) {
      axios
        .get(`${this.gatewayUrl}/gateway/contracts-by-source?id=${this.sourceId}&limit=${this.limit}&page=${page}`)
        .then(async (fetchedContracts) => {
          this.contracts = [];
          this.paging = fetchedContracts.data.paging;
          const contracts = fetchedContracts.data.contracts;
          console.log(contracts);
          for (const c of contracts) {
            this.contracts.push({
              id: c.contractId,
              owner: c.owner,
              bundlerId: c.bundlerTxId,
              blockHeight: c.blockHeight,
              age: this.timeAgo(dayjs.unix(c.blockTimestamp)),
              interactions: c.interactions,
            });
          }
        });
    },
    async getSource() {
      if (this.axiosSource) {
        this.axiosSource.cancel('Cancel previous request');
      }
      const CancelToken = axios.CancelToken;
      this.axiosSource = CancelToken.source();
      this.total = null;

      axios
        .get(`${this.gatewayUrl}/gateway/contract-source?id=${this.sourceId}`)
        .then(async (fetchedContractSource) => {
          const source = fetchedContractSource.data;
          this.loadedSource = true;
          this.wasmLang = source.srcWasmLang;
          this.owner = source.owner;
          this.bundlerSrcTxId = source.bundlerSrcTxId;
          this.srcContentType = source.srcContentType;
        });
    },
    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '');
    },
  },
};
</script>

<style src="./Source.scss" lang="scss" scoped></style>
<style lang="scss" scoped>
.contract-tabs > .tabs > div:first-of-type {
  height: 44px;
}

.table thead th:nth-of-type(2),
.table thead th:nth-of-type(5),
.table thead th:nth-of-type(6) {
  width: 10%;
}

#confirmation-status-group {
  .custom-control-input:checked ~ .custom-control-label:after {
    background-color: var(--warp-blue-color) !important;
    border-color: var(--warp-blue-color) !important;
    border-radius: 50%;
  }
}
</style>
