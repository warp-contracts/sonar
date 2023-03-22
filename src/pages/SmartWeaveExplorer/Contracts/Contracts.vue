<template>
  <div>
    <div class="charts-wrapper">
      <TestnetLabel v-if="isTestnet" :isTestnet="isTestnet"></TestnetLabel>
      <div class="charts d-none d-md-flex">
        <div class="chart-single-wrapper">
          <div class="chart-header">
            <div>Interactions</div>
            <router-link
              class="d-xl-block d-none"
              :to="{
                path: `/app/stats/interactions${this.isTestnet ? '?network=testnet' : ''}`,
              }"
              style="margin-left: auto; cursor: pointer"
            >
              <div class="flaticon-fullscreen" />
            </router-link>
          </div>
          <Charts :gatewayUrl="gatewayUrl" :statsPerDay="interactionsPerDay" title="Interactions" :fullscreen="false" />
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
                path: `/app/stats/contracts${this.isTestnet ? '?network=testnet' : ''}`,
              }"
              style="margin-left: auto; cursor: pointer"
            >
              <div class="flaticon-fullscreen" />
            </router-link>
          </div>
          <Charts :gatewayUrl="gatewayUrl" :statsPerDay="contractsPerDay" title="Contracts" :fullscreen="false" />
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
                primary-key="interactionId"
              >
                <template #table-busy> </template>
                <template #cell(interactionId)="data" class="text-right">
                  <div class="d-flex align-items-center fade-in-fwd">
                    <router-link
                      :to="{
                        path: '/app/interaction/' + data.item.interactionId,
                        query: isTestnet ? { network: 'testnet' } : '',
                      }"
                    >
                      {{ data.item.interactionId.slice(0, 5) + '..' }}
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
                      style="min-width: 126px"
                      :to="{
                        path: '/app/contract/' + data.item.contractId,
                        query: isTestnet ? { network: 'testnet' } : '',
                      }"
                    >
                      {{ data.item.contractId | tx }}
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
                  <div v-else-if="data.item.source == 'warp'">
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
                <template #cell(age)="data">
                  <div class="text-right">
                    {{ data.item.age ? data.item.age : 'N/A' }}
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
                      style="min-width: 126px"
                      :to="{
                        path: '/app/contract/' + data.item.contractId,
                        query: isTestnet ? { network: 'testnet' } : '',
                      }"
                    >
                      {{ data.item.contractId | tx }}
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
                  <a v-if="!isTestnet" :href="`#/app/creator/${data.item.owner}`"> {{ data.item.owner | tx }}</a>
                  <span v-else>{{ data.item.owner | tx }}</span>
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

                <template #cell(age)="data">
                  <div class="text-right">
                    {{ data.item.age ? data.item.age : 'N/A' }}
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
import TestnetLabel from '../../../components/TestnetLabel.vue';
import { subscribe, initPubSub } from 'warp-contracts-pubsub';
import { format } from 'numerable';
import { convertTime } from '@/utils';
import dayjs from 'dayjs';

const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

export default {
  name: 'Contracts',
  data() {
    return {
      transProps: {
          // Transition name
          name: 'flip-list'
        },
      selected: 'all',
      selectedSource: 'all',
      chartLoading: true,
      loading: true,
      contractFields: [
        'contractId',
        'creator',
        'type',
        'source',
        {
          key: 'age',
          label: 'ago',
          thClass: 'text-right',
          tdClass: 'text-right',
        },
      ],
      interactionsFields: [
        'interactionId',
        'contractId',
        'function',
        'source',
        {
          key: 'age',
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
    };
  },
  mounted() {
    this.initPubSub();
    this.currentPage = this.$route.query.page ? this.$route.query.page : 1;
    this.getContracts(this.$route.query.page ? this.$route.query.page : this.currentPage);
    this.loadStats();
    this.subscribeForContracts();
    // this.subscribeForInteractions();
    // this.getTableElement();
  },
  components: { TxList, Charts, TestnetLabel },
  watch: {
    isTestnet() {
      this.refreshData();
      this.loadStats();
    },
    contracts: {
      handler: function (val, oldVal) {
        // console.log('a thing changed');
        const newItem = document.querySelector('#contracts-table tbody tr');
        console.log(newItem)
        newItem.style.opacity = 0;
        newItem.style.transition = "opacity 0.2s ease"
        setTimeout(() => {
          newItem.style.opacity = 1;
        }, 300);
        // newItem.classList.add('fade-in-fwd')
        // const items = document.querySelectorAll('#contracts-table td');
        // const pickedItems = Array.from(items).slice(1, 15);
        // pickedItems.forEach((element) => {
        //   element.classList.remove('fade-in-fwd');
        // });
        // pickedItems.classList.remove('fade-in-fwd');
        // console.log(newItem);
      },
      deep: true,
    },
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'isTestnet']),
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
    convertTime: convertTime,
    format: format,
    initPubSub: initPubSub,
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
      axios.get(`${this.gatewayUrl}/gateway/stats${this.isTestnet ? '?testnet=true' : ''}`).then((fetchedData) => {
        this.totalContracts = fetchedData.data.total_contracts;
        this.totalInteractions = fetchedData.data.total_interactions;
        this.totalContractsLoaded = true;
        this.totalInteractionsLoaded = true;
      });
    },
    async getStatsPerDay() {
      axios
        .get(`${this.gatewayUrl}/gateway/stats/per-day${this.isTestnet ? '?testnet=true' : ''}`)
        .then((fetchedData) => {
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
          `${this.gatewayUrl}/gateway/dashboard?contractLimit=${this.contractsLimit}&interactionLimit=${
            this.integrationsLimit
          }${this.isTestnet ? '&testnet=true' : ''}`,
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
                age: convertTime(dayjs.unix(+contract.block_timestamp), null),
                type: contract.contract_type,
                source: contract.source,
              });
            });
          fetchedContracts.data.contracts
            .filter((item) => item.contract_or_interaction === 'interaction')
            .forEach((interaction) => {
              console.log(interaction)
              this.interactions.push({
                interactionId: interaction.interaction_id,
                contractId: interaction.contract_id,
                owner: interaction.owner,
                function: interaction.function,
                age: convertTime(dayjs.unix(+interaction.block_timestamp), null, 'Europe/London'),
                source: interaction.source,
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
      const subscription = await subscribe(
        `contracts`,
        ({ data }) => {
          let dataObj = JSON.parse(data);
          this.contracts.unshift({
            contractId: dataObj.contractTxId,
            owner: dataObj.creator,
            age: convertTime(dayjs.unix(dataObj.timestamp), null),
            type: dataObj.type,
            source: dataObj.source,
          });
          this.contracts.pop();
        },
        console.error
      );
    },

    async subscribeForInteractions() {
      const subscription = await subscribe(
        `interactions`,
        ({ data }) => {
          let dataObj = JSON.parse(data);
          this.interactions.unshift({
            interactionId: dataObj.interaction.id,
            contractId: dataObj.contractTxId,
            age: convertTime(dayjs.unix(dataObj.interaction.block.timestamp), null, 'Europe/London'),
            function: dataObj.functionName ? dataObj.functionName : 'N/A',
            blockHeight: dataObj.interaction.block.height,
            source: dataObj.source,
          });
          this.interactions.pop();
        },
        console.error
      );
    },
    // getTableElement() {
    //   const tableBody = document.querySelectorAll('tbody');
    //   tableBody.forEach((element) => {
    //     element.setAttribute('is', 'transition-group');
    //     element.setAttribute('name', 'fade');
    //   });
    //   console.log(tableBody);
    // },
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
  max-height: 700px;
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

.fade-in-fwd {
  -webkit-animation: fade-in-fwd 1.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
  animation: fade-in-fwd 1.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
}

@-webkit-keyframes fade-in-fwd {
  0% {
    -webkit-transform: translateZ(-80px);
    transform: translateZ(-80px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    opacity: 1;
  }
}
@keyframes fade-in-fwd {
  0% {
    -webkit-transform: translateZ(-80px);
    transform: translateZ(-80px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    opacity: 1;
  }
}

@keyframes fadeMe {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
