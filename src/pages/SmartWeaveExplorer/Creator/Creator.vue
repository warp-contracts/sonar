<template>
  <div>
    <div v-if="correct" class="contract-wrapper">
      <NetworkLabel :network="network"></NetworkLabel>
      <div class="d-block d-md-flex pl-3">
        <div class="contract-header-wrapper">
          <div class="flaticon-file-signature m-0-auto"></div>
          <div class="align-self-end contract-header">
            <span>Creator</span>
          </div>
        </div>
        <div class="align-self-end pl-md-3 pl-5 contract-id d-flex">
          <span class="d-none d-sm-block">{{ contractId }}</span
          ><span class="d-block d-sm-none">{{ contractId | tx }}</span>
          <div
            class="flaticon-copy-to-clipboard"
            v-clipboard="contractId"
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
              <div class="cell-header">Total transactions</div>
              <div v-if="total">{{ total }}</div>
              <div v-else-if="total == 0">0</div>
              <div v-else class="pl-3 pt-3">
                <div class="dot-flashing"></div>
              </div>
            </div>
            <div class="cell">
              <div class="cell-header">
                <a target="_blank" :href="`https://v2.viewblock.io/arweave/address/${contractId}?network=${network}`"
                  >Viewblock link</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <b-nav tabs class="contract-tabs" @changed="onInput">
          <b-nav-item
            :to="`?network=${network}#`"
            :active="$route.hash === '#' || $route.hash === ''"
            @click="onInput($route.hash)"
          >
            Transactions
          </b-nav-item>
        </b-nav>
        <div class="tab-content">
          <div :class="['tab-pane', { active: $route.hash === '#' || $route.hash === '' }]" class="p-2">
            <div v-if="!noTransactionsDetected">
              <div class="d-block d-sm-flex justify-content-between mb-4">
                <b-col lg="9" class="my-1 d-sm-flex d-block py-3 px-0">
                  <p class="filter-header mr-4 ml-2">Type</p>
                  <b-form-radio-group
                    id="confirmation-status-group"
                    name="confirmation-status-group"
                    @change="refreshData"
                    v-model="selected"
                    class="confirmation-status-group"
                  >
                    <div class="confirmation-status-item">
                      <b-form-radio value="all">All</b-form-radio>
                    </div>
                    <div class="confirmation-status-item">
                      <b-form-radio value="interaction">Interaction</b-form-radio>
                    </div>
                    <div class="confirmation-status-item">
                      <b-form-radio value="contract">Contract</b-form-radio>
                    </div>
                  </b-form-radio-group>
                </b-col>

                <b-button
                  class="btn btn-refresh d-flex justify-content-center align-items-center rounded-pill mb-3 mb-sm-0"
                  @click="refreshData"
                  ><p class="m-0" v-if="transactionsLoaded">Refresh data</p>
                  <div v-else>
                    <div class="dot-flashing"></div>
                  </div>
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
                      <div class="d-flex align-items-center">
                        <img
                          v-if="data.item.transactionType == 'interaction'"
                          class="type-icon"
                          src="@/assets/icons/interaction.svg"
                          alt=""
                          srcset=""
                        />
                        <img
                          v-if="data.item.transactionType == 'contract'"
                          class="type-icon"
                          src="@/assets/icons/contract-ico.svg"
                          alt=""
                          srcset=""
                        />
                        <p class="mb-0 ml-2">{{ data.item.transactionType.toUpperCase() }}</p>
                      </div></template
                    >

                    <template #cell(id)="data">
                      <div class="d-flex">
                        <a
                          v-if="data.item.transactionType == 'contract'"
                          :href="`/#/app/contract/${data.item.id}?network=${network}`"
                        >
                          {{ data.item.id | tx }}</a
                        >
                        <a
                          v-if="data.item.transactionType == 'interaction'"
                          :href="`/#/app/interaction/${data.item.id}?network=${network}`"
                        >
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
                      {{ data.item.blockHeight }}
                    </template>
                  </b-table>
                </TxList>
                <div v-if="!transactionsLoaded">
                  <div v-for="n in 15" :key="n" class="preloader text-preloader tx-preloader"></div>
                </div>
              </div>
            </div>
            <div v-else class="transactions-wrapper">Contract has no transactions!</div>
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
import { mapState } from 'vuex';
import Error from '@/components/Error/Error';
import dayjs from 'dayjs';
import TxList from '@/components/TxList/TxList';
import NetworkLabel from '../../../components/NetworkLabel.vue';

const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

export default {
  name: 'Creator',

  data() {
    return {
      visitedTabs: [],
      transactions: [],
      correct: false,
      total: null,
      paging: null,
      noTransactionsDetected: false,
      selected: 'all',
      copiedDisplay: false,
      currentPage: 1,
      limit: 15,
      epochs: [
        ['year', 31536000],
        ['month', 2592000],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
        ['second', 1],
      ],
      fields: ['type', 'id', 'bundlerId', 'block_height', 'age', { key: 'actions', label: '' }],
    };
  },
  components: {
    Error,
    TxList,
    NetworkLabel,
  },
  async mounted() {
    if (this.$route.params.id.length == 42 || this.$route.params.id.length == 43) {
      this.correct = true;
    } else {
      this.correct = false;
    }

    this.getTransactions(this.$route.query.page ? this.$route.query.page : this.currentPage);
    this.visitedTabs.push(this.$route.hash);
  },
  methods: {
    async getTransactions(page, txType) {
      this.transactions = [];
      this.total = null;

      const response = await fetch(
        `${this.gatewayUrl}/gateway/creator?id=${this.contractId}&limit=${this.limit}&totalCount=true&page=${page}${
          txType ? `&txType=${txType}` : ''
        }`
      );
      if (!response.ok) {
        this.correct = false;
      }

      const data = await response.json();
      this.total = data.paging.total;
      this.paging = data.paging;
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
      this.currentPage = pageNumber;
      if (this.selected == 'all') {
        this.getTransactions(this.currentPage);
      } else {
        this.getTransactions(this.currentPage, this.selected);
      }
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
      this.currentPage = 1;
      this.$router.push(`/app/contracts?network=${this.network}`);
      this.selected == 'all'
        ? this.getTransactions(this.currentPage)
        : this.getTransactions(this.currentPage, this.selected);
    },
  },

  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'network']),
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

.type-icon {
  filter: invert(44%) sepia(59%) saturate(865%) hue-rotate(193deg) brightness(101%) contrast(89%);
  width: 18px;
  opacity: 0.8;
}

.btn-refresh {
  min-width: 163px;
  min-height: 42px;
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
