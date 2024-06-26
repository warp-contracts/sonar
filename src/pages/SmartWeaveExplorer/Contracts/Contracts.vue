<template>
  <div>
    <div class="charts-wrapper">
      <NetworkLabel :network="network"></NetworkLabel>
      <div class="charts d-none d-md-flex">
        <div class="chart-single-wrapper">
          <div class="chart-header">
            <div>Interactions</div>
            <router-link
              class="d-xl-block d-none"
              :to="{
                path: `/app/stats/interactions?network=${this.network}&dre=${this.activeDre[this.network].dre}`,
              }"
              style="margin-left: auto; cursor: pointer"
            >
              <div class="flaticon-fullscreen" />
            </router-link>
          </div>
          <Charts
            :gatewayUrl="gatewayUrl"
            :statsPerDay="interactionsPerDay"
            title="Interactions"
            :fullscreen="false"
            :key="network"
          />
          <div class="d-flex justify-content-center item-text">
            <div class="d-flex flex-row justify-content-between">
              <div>Total:&nbsp;</div>
              <div class="total-field d-flex justify-content-center">
                <div class="d-flex justify-content-center align-self-center" v-if="totalInteractionsLoaded">
                  {{ format(totalInteractions, '0,0') }}
                </div>
                <div class="d-flex justify-content-center align-self-center dot-flashing" v-else></div>
              </div>
            </div>
          </div>
        </div>
        <div class="d-none d-md-block chart-single-wrapper">
          <div class="chart-header">
            <div>Contracts</div>
            <router-link
              class="d-xl-block d-none"
              :to="{
                path: `/app/stats/contracts?network=${this.network}&dre=${this.activeDre[this.network].dre}`,
              }"
              style="margin-left: auto; cursor: pointer"
            >
              <div class="flaticon-fullscreen" />
            </router-link>
          </div>
          <Charts
            :gatewayUrl="gatewayUrl"
            :statsPerDay="contractsPerDay"
            title="Contracts"
            :fullscreen="false"
            :key="network"
          />
          <div class="d-flex justify-content-center item-text">
            <div class="d-flex flex-row justify-content-between">
              <div>Total:&nbsp;</div>
              <div class="total-field d-flex justify-content-center">
                <div class="d-flex justify-content-center align-self-center" v-if="totalContractsLoaded">
                  {{ format(totalContracts, '0,0') }}
                </div>
                <div class="d-flex justify-content-center align-self-center dot-flashing" v-else></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="stats-wrapper d-block d-md-none">
        <div class="item-text total-contracts">
          <div>Total contracts</div>
          <div class="d-flex justify-content-center">
            <div v-if="totalContractsLoaded">
              <div>{{ format(totalContracts, '0,0') }}</div>
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
              <div>{{ format(totalInteractions, '0,0') }}</div>
            </div>
            <div v-else class="align-self-center mt-4">
              <div class="dot-flashing"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="contracts-wrapper">
      <div class="tx-lists-wrapper d-md-flex">
        <div class="tx-list-single-wrapper">
          <div class="tx-list-header">
            <div>Latest Interactions</div>
          </div>
          <div class="tx-list">
            <TxList :paging="null" v-if="!noContractsDetected">
              <b-table
                ref="table"
                id="interactions-table"
                stacked="md"
                hover
                :items="interactions"
                :fields="interactionsFields"
                @row-clicked="rowClicked"
                :busy="!contractsLoaded"
              >
                <template #table-busy> </template>
                <template #cell(interactionId)="data" class="text-right">
                  <div class="d-flex align-items-center fade-in-fwd">
                    <router-link
                      :to="{
                        path: '/app/interaction/' + data.item.interactionId,
                        query: { network, dre: activeDre[_vm.network].dre },
                      }"
                    >
                      {{ formatIdPattern(data.item.interactionId) }}
                    </router-link>
                    <div class="table-icon-handler">
                      <div
                        class="flaticon-copy-to-clipboard small"
                        v-clipboard="data.item.interactionId"
                        title="Copy to clipboard"
                      ></div>
                    </div>
                  </div>
                </template>
                <template #cell(contractId)="data" class="text-right">
                  <div class="d-flex align-items-center">
                    <router-link
                      :to="{
                        path: '/app/contract/' + data.item.contractId,
                        query: { network, dre: activeDre[_vm.network].dre },
                        dre: {},
                      }"
                    >
                      {{ formatIdPattern(data.item.contractId) }}
                    </router-link>
                    <div class="table-icon-handler">
                      <div
                        class="flaticon-copy-to-clipboard small"
                        v-clipboard="data.item.contractId"
                        title="Copy to clipboard"
                      ></div>
                    </div>
                  </div>
                </template>

                <template #cell(function)="data">
                  <div v-if="!data.item.function">N/A</div>
                  <div
                    v-if="data.item.function && data.item.function.length > 8"
                    style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
                    class="function-cell text-uppercase text-ellipsis"
                    v-b-tooltip.hover
                    :title="data.item.function.toUpperCase()"
                  >
                    {{ data.item.function }}
                  </div>
                  <div v-else class="function-cell text-uppercase text-ellipsis">{{ data.item.function }}</div>
                </template>

                <template #cell(source)="data">
                  <div v-if="data.item.source == 'arweave'">
                    <img
                      v-b-tooltip.hover
                      title="Arweave"
                      src="../../../assets/icons/arweave-ar-logo.svg"
                      alt="arweave logo icon"
                      class="source-icon"
                    />
                  </div>
                  <div v-else-if="data.item.source == 'warp-gw'">
                    <img
                      v-b-tooltip.hover
                      title="Warp"
                      src="../../../assets/icons/warp–logo.svg"
                      alt="warp logo icon"
                      class="source-icon"
                    />
                  </div>
                  <div v-else-if="data.item.source.includes('sequencer')">
                    <img
                      v-b-tooltip.hover
                      title="Warp Sequencer"
                      src="../../../assets/icons/warp–logo.svg"
                      alt="warp logo icon"
                      class="source-icon"
                    />
                  </div>
                  <div v-else class="source-text">{{ data.item.source.toUpperCase() }}</div>
                </template>

                <template #cell(total)="data">
                  <div class="text-right">{{ data.item.total }}</div>
                </template>
                <template #cell(interactionCountdown)="data">
                  <div class="text-right" style="min-width: 80px">
                    {{ data.item.interactionCountdown ? data.item.interactionCountdown : '0s' }}
                  </div>
                </template>
              </b-table>

              <div v-if="!contractsLoaded">
                <div v-for="n in 15" :key="n" class="preloader text-preloader tx-preloader"></div>
              </div>
            </TxList>
          </div>
        </div>

        <div class="d-md-block tx-list-single-wrapper">
          <div class="tx-list-header">
            <div>Latest Contracts</div>
          </div>
          <div class="tx-list">
            <TxList :paging="null" v-if="!noContractsDetected">
              <b-table
                ref="table"
                id="contracts-table"
                stacked="md"
                hover
                :items="contracts"
                :fields="contractFields"
                @row-clicked="rowClicked"
                :busy="!contractsLoaded"
              >
                <template #table-busy> </template>
                <template #cell(contractId)="data" class="text-right">
                  <div class="d-flex align-items-center">
                    <router-link
                      :to="{
                        path: '/app/contract/' + data.item.contractId,
                        query: { network, dre: activeDre[_vm.network].dre },
                      }"
                    >
                      {{ formatIdPattern(data.item.contractId) }}
                    </router-link>
                    <div class="table-icon-handler">
                      <div
                        class="flaticon-copy-to-clipboard small"
                        v-clipboard="data.item.contractId"
                        title="Copy to clipboard"
                      ></div>
                    </div>
                  </div>
                </template>
                <template #cell(creator)="data">
                  <a :href="`#/app/creator/${data.item.owner}`"> {{ formatIdPattern(data.item.owner) }}</a>
                </template>

                <template #cell(type)="data">
                  <div class="text-uppercase">{{ data.item.type }}</div>
                </template>

                <template #cell(source)="data">
                  <div v-if="data.item.source.includes('warp')">
                    <img
                      v-b-tooltip.hover
                      title="Warp"
                      src="../../../assets/icons/warp–logo.svg"
                      alt="warp logo icon"
                      class="source-icon"
                    />
                  </div>
                  <div v-else-if="data.item.source == 'arweave'">
                    <img
                      v-b-tooltip.hover
                      title="Arweave"
                      src="../../../assets/icons/arweave-ar-logo.svg"
                      alt="arweave logo icon"
                      class="source-icon"
                    />
                  </div>
                  <div v-else-if="data.item.source == 'sequencer'">
                    <img
                      v-b-tooltip.hover
                      title="Warp Sequencer"
                      src="../../../assets/icons/warp–logo.svg"
                      alt="warp logo icon"
                      class="source-icon"
                    />
                  </div>
                  <div v-else class="source-text">{{ data.item.source.toUpperCase() }}</div>
                </template>

                <template #cell(contractCountdown)="data">
                  <div class="text-right" style="min-width: 50px">
                    {{ data.item.contractCountdown ? data.item.contractCountdown : '0s' }}
                  </div>
                </template>
              </b-table>

              <div v-if="!contractsLoaded">
                <div v-for="n in 15" :key="n" class="preloader text-preloader tx-preloader"></div>
              </div>
            </TxList>
          </div>
        </div>
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
import NetworkLabel from '../../../components/NetworkLabel.vue';
import { subscribe, initPubSub } from 'warp-contracts-pubsub';
import { format } from 'numerable';
import { convertTime } from '@/utils';
import dayjs from 'dayjs';
import { formatIdPattern } from '@/utils';
import countdown from 'countdown';

const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

export default {
  name: 'Contracts',
  data() {
    return {
      selected: 'all',
      selectedSource: 'all',
      chartLoading: true,
      loading: true,
      contractFields: [
        'contractId',
        'creator',
        'type',
        {
          key: 'source',
          label: 'source',
          thClass: 'text-center',
          tdClass: 'text-center',
        },
        {
          key: 'contractCountdown',
          label: 'ago',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
      ],
      interactionsFields: [
        'interactionId',
        'contractId',
        'function',
        {
          key: 'source',
          label: 'source',
          thClass: 'text-center',
          tdClass: 'text-center',
        },
        {
          key: 'interactionCountdown',
          label: 'ago',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
      ],
      contracts: [],
      interactions: [],
      currentPage: 1,
      summary: null,
      loaded: false,
      contractsLimit: 15,
      integrationsLimit: 15,
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
      contractSubscription: null,
      interactionSubscription: null,
    };
  },
  mounted() {
    countdown.setLabels('ms|s|min| h| d', 'ms|s|min||| wks|| yrs', ' ');
    this.initPubSub();
    this.currentPage = this.$route.query.page ? this.$route.query.page : 1;
    this.getContracts(this.$route.query.page ? this.$route.query.page : this.currentPage);
    this.loadStats();
    this.subscribeForContracts();
    this.subscribeForInteractions();
    this.updateCountdowns();
    setInterval(this.updateCountdowns, 1000);
  },
  destroyed() {
    this.contractSubscription.unsubscribe();
    this.interactionSubscription.unsubscribe();
  },
  components: { TxList, Charts, NetworkLabel },
  watch: {
    network() {
      this.refreshData();
      this.loadStats();
      this.contractSubscription.unsubscribe();
      this.interactionSubscription.unsubscribe();
      this.subscribeForContracts();
      this.subscribeForInteractions();
    },
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'network']),
    ...mapState('drestatus', ['activeDre']),
    contractsLoaded() {
      const totalLimit = this.contractsLimit + this.integrationsLimit;
      const allItems = this.contracts.length + this.interactions.length;
      return (
        this.contracts &&
        this.summary &&
        allItems == (this.summary.itemsCount > totalLimit ? totalLimit : this.summary.itemsCount)
      );
    },
  },
  methods: {
    formatIdPattern: formatIdPattern,
    convertTime: convertTime,
    format: format,
    initPubSub: initPubSub,
    refreshData() {
      if (this.currentPage > 1) {
        this.$router.push(`/app/contracts?network=${this.network}&dre=${this.activeDre[this.network].dre}`);
      }
      this.currentPage = 1;

      this.getContracts(
        this.currentPage,
        this.selected == 'all' ? null : this.selected,
        this.selectedSource == 'all' ? null : this.selectedSource
      );
    },
    async getStats() {
      this.totalContractsLoaded = false;
      this.totalInteractionsLoaded = false;

      axios
        .get(`${this.gatewayUrl}/gateway/stats${this.network == 'testnet' ? '?testnet=true' : ''}`)
        .then((fetchedData) => {
          this.totalContracts = fetchedData.data.total_contracts;
          this.totalInteractions = fetchedData.data.total_interactions;
          this.totalContractsLoaded = true;
          this.totalInteractionsLoaded = true;
        });
    },
    async getStatsPerDay() {
      axios
        .get(`${this.gatewayUrl}/gateway/stats/per-day${this.network == 'testnet' ? '?testnet=true' : ''}`)
        .then((fetchedData) => {
          this.contractsPerDay = fetchedData.data.contracts_per_day;
          this.interactionsPerDay = fetchedData.data.interactions_per_day;
        });
    },
    async loadStats() {
      await Promise.all([this.getStatsPerDay(), this.getStats()]);
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
          `${this.gatewayUrl}/gateway/dashboard?contractLimit=${this.contractsLimit}&interactionLimit=${
            this.integrationsLimit
          }${this.network == 'testnet' ? '&testnet=true' : ''}`,
          {
            cancelToken: this.axiosSource.token,
          }
        )

        .then(async (fetchedContracts) => {
          this.noContractsDetected = fetchedContracts.data.contracts.length == 0;
          this.summary = fetchedContracts.data.summary;
          this.interactions = [];
          this.contracts = [];
          fetchedContracts.data.contracts
            .filter((item) => item.contract_or_interaction === 'contract')
            .forEach((contract) => {
              this.contracts.push({
                id: contract.contract,
                contractId: contract.contract_id,
                owner: contract.owner,
                age: dayjs.unix(Math.floor(contract.sync_timestamp / 1000)),
                contractCountdown: countdown(dayjs.unix(Math.floor(contract.sync_timestamp / 1000))),
                type: contract.contract_type,
                source: contract.source,
              });
            });
          fetchedContracts.data.contracts
            .filter((item) => item.contract_or_interaction === 'interaction')
            .forEach((interaction) => {
              this.interactions.push({
                interactionId: interaction.interaction_id,
                contractId: interaction.contract_id,
                owner: interaction.owner,
                function: interaction.function,
                age: dayjs.unix(Math.floor(interaction.sync_timestamp / 1000)),
                source: interaction.source,
                interactionCountdown: countdown(dayjs.unix(Math.floor(interaction.sync_timestamp / 1000))),
              });
            });
        });
    },
    rowClicked(record) {
      this.$set(record, '_showDetails', !record._showDetails);
    },
    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '');
    },
    async subscribeForContracts() {
      let channel = this.network == 'mainnet' ? 'contracts' : `${this.network}/contracts`;
      this.contractSubscription = await subscribe(
        `${channel}`,
        ({ data }) => {
          let dataObj = JSON.parse(data);
          const time = Date.now();

          this.contracts.unshift({
            contractId: dataObj.contractTxId,
            owner: dataObj.creator,
            age: dataObj.syncTimestamp,
            contractCountdown: countdown(dataObj.syncTimestamp).toString(),
            type: dataObj.type,
            source: dataObj.source,
          });
          this.contracts.pop();
          const newItem = document.querySelector('#contracts-table tbody tr');
          this.animateTableRow(newItem);
        },
        console.error
      );
    },

    async subscribeForInteractions() {
      let channel = this.network == 'mainnet' ? 'interactions' : `${this.network}/interactions`;
      this.interactionSubscription = await subscribe(
        `${channel}`,
        ({ data }) => {
          let dataObj = JSON.parse(data);
          const input = JSON.parse(JSON.parse(dataObj.interaction).tags.find(t => t.name == 'Input').value);
          const sortKey = JSON.parse(dataObj.interaction).sortKey;
          const sortKeySliced = sortKey.substring(sortKey.indexOf(',') + 1);
          const syncTimestamp = sortKeySliced.substring(0, sortKeySliced.indexOf(','));
          const time = Date.now();
          this.interactions.unshift({
            interactionId: JSON.parse(dataObj.interaction).id,
            contractId: dataObj.contractTxId,
            age: syncTimestamp,
            interactionCountdown: countdown(dataObj.syncTimestamp).toString(),
            function: input.function ? input.function : 'N/A',
            source: dataObj.source,
          });
          this.interactions.pop();
          const newItem = document.querySelector('#interactions-table tbody tr');
          this.animateTableRow(newItem);
        },
        console.error
      );
    },
    animateTableRow(row) {
      row.style.opacity = 0;
      row.style.transition = 'opacity 0.2s ease';
      setTimeout(() => {
        row.style.opacity = 1;
      }, 300);
    },
    updateCountdowns() {
      Object.values(this.contracts).forEach((row) => {
        row.contractCountdown = countdown(row.age).toString();
      });
      Object.values(this.interactions).forEach((row) => {
        row.interactionCountdown = countdown(row.age).toString();
      });
    },
  },
};
</script>

<style src="./Contracts.scss" lang="scss" scoped>
.table-icon-handler {
  width: 100%;
}
</style>
<style lang="scss" scoped>
.tx-list {
  overflow: hidden;
}
.total-field {
  min-width: 80px;
}

::v-deep table#contracts-table {
  max-height: 703px;
}

::v-deep table#contracts-table .flip-list-move {
  transition: transform 1s;
}
.total-field {
  min-width: 80px;
}

.source-icon {
  width: 20px;
  height: 20px;
}

.source-text {
  height: 22.25px;
}

::v-deep #interactions-table .function-cell {
  width: 110px;
}

@media (max-width: 1024px) {
  .stats-wrapper {
    .total-contracts {
      margin-top: 0;
    }
  }
}

@media (min-width: 769px) {
  .tx-lists-wrapper {
    .tx-list-single-wrapper {
      min-width: 650px;
    }
  }
}

@media (min-width: 1000px) {
  ::v-deep #interactions-table .function-cell {
    width: 80px;
  }
}
</style>
