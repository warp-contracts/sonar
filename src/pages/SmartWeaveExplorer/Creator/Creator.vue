<template>
  <div class="contract-wrapper">
    <div v-if="!correct">
      <Error />
    </div>
    <div v-else>
      <div>
        <b-nav tabs class="contract-tabs" @changed="onInput">
          <b-nav-item
            :to="`${isTestnet ? '?network=testnet' : ''}#`"
            :active="$route.hash === '#' || $route.hash === ''"
            @click="onInput($route.hash)"
          >
            Transactions
          </b-nav-item>
        </b-nav>
        <div class="tab-content">
          <div :class="['tab-pane', { active: $route.hash === '#' || $route.hash === '' }]" class="p-2">
            <div v-if="!noTransactionsDetected">
              <div class="d-block d-sm-flex justify-content-between">
                <b-col lg="9" class="my-1 d-sm-flex d-block py-3 px-0">
                  <!-- <p class="filter-header mr-4 ml-2" v-if="!isTestnet">Confirmation Status</p> -->
                  <!-- <b-form-radio-group
                    id="confirmation-status-group"
                    name="confirmation-status-group"
                    @change="refreshData"
                    v-model="selected"
                    class="confirmation-status-group"
                    v-if="!isTestnet"
                  >
                    <div class="confirmation-status-item">
                      <b-form-radio value="all">All</b-form-radio>
                      <div
                        v-b-tooltip.hover
                        title="Show all contract transactions."
                        class="flaticon-question-tooltip lowered"
                      />
                    </div>
                    <div class="confirmation-status-item">
                      <b-form-radio value="confirmed">Confirmed</b-form-radio>
                      <div
                        v-b-tooltip.hover
                        title="Show contract transactions which have been positively confirmed by at least three different nodes."
                        class="flaticon-question-tooltip lowered"
                      />
                    </div>
                    <div class="confirmation-status-item">
                      <b-form-radio value="corrupted">Corrupted</b-form-radio>
                      <div
                        v-b-tooltip.hover
                        title="Show corruptetransactions which are not part of any block but are still returned by Arweave GQL endpoint."
                        class="flaticon-question-tooltip lowered"
                      />
                    </div>
                    <div class="confirmation-status-item">
                      <b-form-radio value="not_corrupted">Not corrupted </b-form-radio>
                      <div
                        v-b-tooltip.hover
                        title="Show both confirmed and not yet processed transactions."
                        class="flaticon-question-tooltip lowered"
                      />
                    </div>
                  </b-form-radio-group> -->
                </b-col>

                <b-button class="btn btn-refresh rounded-pill mb-3 mb-sm-0" @click="refreshData"
                  >Refresh data
                </b-button>
              </div>
              <div>
                <TxList :paging="pages" v-if="transactionsLoaded" @page-clicked="onPageClicked">
                  <b-table
                    v-if="transactions?.length > 0"
                    ref="table"
                    id="transactions-table"
                    stacked="md"
                    hover
                    :items="transactions"
                    :fields="fields"
                    @row-clicked="rowClicked"
                    :busy="!transactionsLoaded"
                  >
                    <template #table-busy></template>

                    <template #cell(type)="data">
                      <div>{{ data.item.transactionType }}</div></template
                    >

                    <template #cell(id)="data">
                      <div class="d-flex">
                        <a :href="`/#/app/interaction/${data.item.id}${isTestnet ? '?network=testnet' : ''}`">
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

                    <!-- <template #cell(validity)="data">
                      <div
                        v-show="validity && validity[data.item.interactionId] == true"
                        class="flaticon-check centered"
                      />
                      <div
                        v-show="validity && validity[data.item.interactionId] == false"
                        class="flaticon-cross centered"
                      />
                      <div v-show="loadedValidity && !validity" class="text-center">N/A</div>
                      <div v-show="!loadedValidity" class="dot-flashing centered"></div>
                    </template> -->

                    <!-- <template #cell(block_id)="data">
                      <a
                        :href="`${
                          isTestnet
                            ? `https://testnet.redstone.tools/block/hash/${data.item.blockId}`
                            : `https://v2.viewblock.io/arweave/block/${data.item.blockId}`
                        }`"
                        target="_blank"
                      >
                        {{ data.item.blockId | tx }}
                      </a>
                    </template> -->

                    <template #cell(block_height)="data">
                      {{ data.item.blockHeight }}
                    </template>

                    <!-- <template #cell(owner)="data">
                      <a
                        v-if="!isTestnet"
                        :href="`https://v2.viewblock.io/arweave/address/${data.item.owner}`"
                        target="_blank"
                      >
                        {{ data.item.owner | tx }}</a
                      >
                      <span v-else> {{ data.item.owner | tx }}</span>
                    </template> -->

                    <!-- <template #cell(function)="data">
                      {{ data.item.function }}
                    </template> -->

                    <!-- <template #cell(status)="data">
                      {{ data.item.status }}
                    </template> -->

                    <!-- <template #cell(actions)="data">
                      <div v-if="!data.item._showDetails" class="flaticon-chevron-down" />
                      <div v-else class="flaticon-chevron-up" />
                    </template> -->

                    <!-- <template slot="row-details" slot-scope="data">
                      <div>
                        <p class="json-header">Contract Input:</p>
                        <json-viewer
                          :value="data.item.tags"
                          :expand-depth="1"
                          copyable
                          sort
                          theme="json-theme"
                        ></json-viewer>
                        <hr />
                        <p class="json-header">Full transaction:</p>
                        <json-viewer
                          :value="data.item.interaction"
                          :expand-depth="1"
                          copyable
                          sort
                          theme="json-theme"
                        ></json-viewer>
                      </div>
                    </template> -->
                  </b-table>
                </TxList>
                <div v-if="!transactionsLoaded">
                  <div v-for="n in 15" :key="n" class="preloader text-preloader tx-preloader"></div>
                </div>
              </div>
            </div>
            <div v-else class="transactions-wrapper">Contract has no transactions!</div>
          </div>
          <!-- <div :class="['tab-pane', { active: $route.hash === '#code' }]" class="p-2">
            <div v-if="visitedTabs.includes('#code')">
              <ContractCode v-if="loadedContract" :sourceId="sourceTxId" :wasm="!!wasmLang"></ContractCode>
            </div>
          </div>
          <div :class="['tab-pane', { active: $route.hash === '#state' }]" class="p-2">
            <div>
              <ContractState v-if="initState" :contractId="contractId" :initState="initState"></ContractState>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Error from '@/components/Error/Error';
import dayjs from 'dayjs';
import TxList from '@/components/TxList/TxList';

const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

export default {
  name: 'Creator',

  data() {
    return {
      transactions: [],
      correct: false,
      total: null,
      paging: null,
      noTransactionsDetected: false,
      selected: null,
      epochs: [
        ['year', 31536000],
        ['month', 2592000],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
        ['second', 1],
      ],
      fields: [
        'type',
        'id',
        'bundlerId',
        // {
        //   key: 'validity',
        //   label: 'valid',
        //   thClass: 'text-center',
        // },
        'block_height',
        'age',
        { key: 'actions', label: '' },
      ],
    };
  },
  components: {
    Error,
    TxList,
  },
  async mounted() {
    if (this.$route.params.id.length != 43) {
      this.correct = false;
    } else {
      this.correct = true;
    }

    this.getTransactions();
  },
  methods: {
    async getTransactions() {
      this.transactions = [];
      this.total = null;

      const response = await fetch(`${this.gatewayUrl}/gateway/creator?id=${this.contractId}`);
      if (!response.ok) {
        this.correct = false;
      }

      const data = await response.json();

      console.log(data.transactions);
      this.total = data.total;
      for (let t of data.transactions) {
        this.transactions.push({
          id: t.id,
          bundlerId: t.bundler_id,
          blockHeight: t.block_height,
          timestamp: t.block_timestamp,
          transactionType: t.type,
          age: this.timeAgo(dayjs.unix(t.block_timestamp)),
        });
      }
    },
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
    timeAgo(date, sortKeyTimestamp) {
      const timeAgoInSeconds = Math.floor(
        (this.convertTZ(new Date(), 'Europe/Berlin') -
          this.convertTZ(
            new Date(sortKeyTimestamp ? sortKeyTimestamp : date),
            sortKeyTimestamp ? 'Europe/Berlin' : 'Europe/London'
          )) /
          1000
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
    rowClicked(record) {
      this.$set(record, '_showDetails', !record._showDetails);
    },
    async onPageClicked(pageNumber) {
      //   this.currentPage = pageNumber;
      //   if (this.selected == 'all') {
      //     this.getTransactions(this.currentPage);
      //   } else {
      //     this.getTransactions(this.currentPage, this.selected);
      //   }
      console.log('onPageClicked');
    },
    onCopy() {
      this.copiedDisplay = true;
      setTimeout(() => (this.copiedDisplay = false), 2000);
    },
    onCopyOwner() {
      this.copiedDisplayOwner = true;
      setTimeout(() => (this.copiedDisplayOwner = false), 2000);
    },
    onCopyContractId() {
      this.copiedContractIdDisplay = true;
      setTimeout(() => (this.copiedContractIdDisplay = false), 2000);
    },
    onInput(value) {
      if (!this.visitedTabs.includes(value)) {
        this.visitedTabs.push(value);
      }
    },
    refreshData() {
      //   this.currentPage = 1;
      //   this.$router.push({ query: {} });
      //   this.selected == 'all'
      //     ? this.getTransactions(this.currentPage)
      //     : this.getTransactions(this.currentPage, this.selected);
      window.reload;
    },
  },

  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'isTestnet']),
    contractId() {
      return this.$route.params.id;
    },
    transactionsLoaded() {
      return this.transactions !== null && this.total !== null;
    },
    pages() {
      return this.paging ? this.paging : null;
    },
  },
};
</script>

<style src="../Contract/Contract.scss" lang="scss" scoped></style>
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
