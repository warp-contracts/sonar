<template>
  <div>
    <div v-if="loadingInitialized && correct" class="contract-wrapper">
      <div class="d-block d-md-flex pl-3">
        <div class="contract-header-wrapper">
          <div class="flaticon-file-signature m-0-auto"></div>
          <div class="align-self-end contract-header">
            <span>Contract</span>
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
          <p
            class="clipboard-success"
            v-bind:class="{ hidden: !copiedDisplay, visible: copiedDisplay }"
          >
            Copied
          </p>
        </div>
      </div>
      <div class="contract-details-wrapper">
        <div class="d-block d-md-flex">
          <div class="col-6 p-0">
            <div class="cell">
              <div class="cell-header">Owner</div>
              <div class="d-flex">
                <div v-if="owner" class="align-self-end d-flex">
                  <span class="d-none d-sm-block">{{ owner }}</span
                  ><span class="d-block d-sm-none">{{ owner | tx }}</span>
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
                <div v-else class="pl-3 pt-3">
                  <div class="dot-flashing"></div>
                </div>
              </div>
            </div>
            <div class="cell">
              <div class="cell-header">Total interactions</div>
              <div>{{ total }}</div>
            </div>
            <div v-if="pst_ticker" class="cell">
              <div class="cell-header">PST Ticker</div>
              <div>{{ pst_ticker }}</div>
            </div>
            <div v-if="wasmLang" class="cell">
              <div class="cell-header">WASM</div>
              <div>{{ wasmLang }}</div>
            </div>
          </div>
          <div class="col-6 p-0">
            <div class="cell">
              <div class="cell-header">Confirmed interactions</div>
              <div>{{ confirmed }}</div>
            </div>
            <div class="cell">
              <div class="cell-header">Corrupted interactions</div>
              <div>{{ corrupted }}</div>
            </div>
            <div v-if="pst_name" class="cell">
              <div class="cell-header">PST Name</div>
              <div>{{ pst_name }}</div>
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
            Transactions
          </b-nav-item>
          <b-nav-item
            v-if="!wasmLang"
            :to="`${isTestnet ? '?network=testnet' : ''}#code`"
            :active="$route.hash === '#code'"
            @click="onInput($route.hash)"
          >
            Code
          </b-nav-item>
          <b-nav-item
            :to="`${isTestnet ? '?network=testnet' : ''}#state`"
            :active="$route.hash === '#state'"
            @click="onInput($route.hash)"
          >
            State
          </b-nav-item>
        </b-nav>
        <div class="tab-content">
          <div
            :class="[
              'tab-pane',
              { active: $route.hash === '#' || $route.hash === '' },
            ]"
            class="p-2"
          >
            <div v-if="!noInteractionsDetected">
              <div class="d-block d-sm-flex justify-content-between">
                <b-col lg="9" class="my-1 d-sm-flex d-block py-3 px-0">
                  <p class="filter-header mr-4 ml-2" v-if="!isTestnet">
                    Confirmation Status
                  </p>
                  <b-form-radio-group
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
                        title="Show all contract interactions."
                        class="flaticon-question-tooltip"
                      />
                    </div>
                    <div class="confirmation-status-item">
                      <b-form-radio value="confirmed">Confirmed</b-form-radio>
                      <div
                        v-b-tooltip.hover
                        title="Show contract interactions which have been positively confirmed by at least three different nodes."
                        class="flaticon-question-tooltip"
                      />
                    </div>
                    <div class="confirmation-status-item">
                      <b-form-radio value="corrupted">Corrupted</b-form-radio>
                      <div
                        v-b-tooltip.hover
                        title="Show corrupted contract interactions which are not part of any block but are still returned by Arweave GQL endpoint."
                        class="flaticon-question-tooltip"
                      />
                    </div>
                    <div class="confirmation-status-item">
                      <b-form-radio value="not_corrupted"
                        >Not corrupted
                      </b-form-radio>
                      <div
                        v-b-tooltip.hover
                        title="Show both confirmed and not yet processed interactions."
                        class="flaticon-question-tooltip"
                      />
                    </div>
                  </b-form-radio-group>
                </b-col>

                <b-button
                  class="btn btn-refresh rounded-pill mb-3 mb-sm-0"
                  @click="refreshData"
                  >Refresh data
                </b-button>
              </div>
              <div>
                <TxList
                  :paging="pages"
                  v-if="interactionsLoaded"
                  @page-clicked="onPageClicked"
                >
                  <b-table
                    v-if="interactions?.length > 0"
                    ref="table"
                    id="interactions-table"
                    stacked="md"
                    hover
                    :items="interactions"
                    :fields="computedFields"
                    @row-clicked="rowClicked"
                    :busy="!interactionsLoaded"
                  >
                    <template #table-busy></template>

                    <template #cell(id)="data">
                      <a
                        :href="
                          `/#/app/interaction/${data.item.interactionId}${
                            isTestnet ? '?network=testnet' : ''
                          }`
                        "
                      >
                        {{ data.item.interactionId | tx }}</a
                      >
                    </template>

                    <template #cell(validity)="data">
                      <div
                        v-show="data.item.validity == true"
                        class="
                          flaticon-check
                        "
                      />
                      <div
                        v-show="data.item.validity == false"
                        class="
                          flaticon-cross
                        "
                      />
                    </template>

                    <template #cell(block_id)="data">
                      <a
                        :href="
                          `https://viewblock.io/arweave/block/${data.item.blockId}`
                        "
                        target="_blank"
                      >
                        {{ data.item.blockId | tx }}
                      </a>
                    </template>

                    <template #cell(block_height)="data">
                      {{ data.item.blockHeight }}
                    </template>

                    <template #cell(owner)="data">
                      <a
                        :href="
                          `https://viewblock.io/arweave/address/${data.item.owner}`
                        "
                        target="_blank"
                      >
                        {{ data.item.owner | tx }}</a
                      >
                    </template>

                    <template #cell(function)="data">
                      {{ data.item.function }}
                    </template>

                    <template #cell(status)="data">
                      {{ data.item.status }}
                    </template>

                    <template #cell(confirmingPeers)="data">
                      <div v-if="data.item.confirmingPeers[0] != '-'">
                        <a
                          :href="
                            `${
                              data.item.source && data.item.source == 'arweave'
                                ? `http://${data.item.confirmingPeers[0]}:1984/tx/${data.item.interactionId}/status`
                                : `https://node1.bundlr.network`
                            }`
                          "
                          target="_blank"
                          class="mr-1"
                        >
                          {{ data.item.confirmingPeers[0] }}</a
                        >
                        <a
                          :href="
                            `${
                              data.item.source && data.item.source == 'arweave'
                                ? `http://${data.item.confirmingPeers[0]}:1984/tx/${data.item.interactionId}/status`
                                : `https://node1.bundlr.network`
                            }`
                          "
                          target="_blank"
                          class="mr-1"
                        >
                          {{ data.item.confirmingPeers[1] }}</a
                        >
                        <a
                          :href="
                            `${
                              data.item.source && data.item.source == 'arweave'
                                ? `http://${data.item.confirmingPeers[0]}:1984/tx/${data.item.interactionId}/status`
                                : `https://node1.bundlr.network`
                            }`
                          "
                          target="_blank"
                          class="mr-1"
                        >
                          {{ data.item.confirmingPeers[2] }}</a
                        >
                      </div>
                      <div v-else>{{ data.item.confirmingPeers }}</div>
                    </template>

                    <template #cell(actions)="data">
                      <div
                        v-if="!data.item._showDetails"
                        class="flaticon-chevron-down"
                      />
                      <div v-else class="flaticon-chevron-up" />
                    </template>

                    <template slot="row-details" slot-scope="data">
                      <div>
                        <p class="json-header">Contract Input:</p>
                        <json-viewer
                          :value="data.item.tags"
                          :expand-depth="1"
                          copyable
                          sort
                        ></json-viewer>
                        <hr />
                        <p class="json-header">Full transaction:</p>
                        <json-viewer
                          :value="data.item.interaction"
                          :expand-depth="1"
                          copyable
                          sort
                        ></json-viewer>
                      </div>
                    </template>
                  </b-table>
                </TxList>
                <div v-if="!interactionsLoaded">
                  <div
                    v-for="n in 15"
                    :key="n"
                    class="preloader text-preloader tx-preloader"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="interactions-wrapper">
              Contract has no interactions!
            </div>
          </div>
          <div
            :class="['tab-pane', { active: $route.hash === '#code' }]"
            class="p-2"
          >
            <div v-if="visitedTabs.includes('#code')">
              <ContractCode :contractId="contractId"></ContractCode>
            </div>
          </div>
          <div
            :class="['tab-pane', { active: $route.hash === '#state' }]"
            class="p-2"
          >
            <div>
              <ContractState :contractId="contractId"></ContractState>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="loadingInitialized && !correct">
      <Error />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import TxList from '@/components/TxList/TxList';
import { TagsParser } from 'redstone-smartweave';
import JsonViewer from 'vue-json-viewer';
import ContractCode from './ContractCode/ContractCode';
import ContractState from './ContractState/ContractState';
import dayjs from 'dayjs';
import Error from '@/components/Error/Error';
import { mapState } from 'vuex';

export default {
  name: 'Contract',

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
        {
          key: 'validity',
          label: 'validity',
          thClass: 'text-center',
        },
        'block_id',
        'block_height',
        'age',
        'owner',
        'function',
        'status',
        'confirmingPeers',
        { key: 'actions', label: '' },
      ],
      interactions: null,
      currentPage: 1,
      paging: null,
      owner: '',
      total: null,
      confirmed: 0,
      corrupted: 0,
      limit: 15,
      selected: 'all',
      copiedDisplay: false,
      copiedDisplayOwner: false,
      loadingInitialized: false,
      correct: false,
      pst_ticker: null,
      pst_name: null,
      noInteractionsDetected: false,
      wasmLang: null,
    };
  },
  watch: {
    contractId: function() {
      this.$router.go(0);
    },
  },
  async mounted() {
    if (this.$route.params.id.length != 43) {
      this.loadingInitialized = true;
      this.correct = false;
    } else {
      this.loadingInitialized = true;
      this.correct = true;
    }
    this.validity = await this.getInteractionValidity();
    this.getInteractions(
      this.$route.query.page ? this.$route.query.page : this.currentPage
    );
    this.getContract();

    this.visitedTabs.push(this.$route.hash);
  },

  components: {
    TxList,
    JsonViewer,
    Error,
    ContractState,
    ContractCode,
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'isTestnet']),
    contractId() {
      return this.$route.params.id;
    },
    pages() {
      return this.paging ? this.paging : null;
    },
    interactionsLoaded() {
      return this.interactions !== null && this.total !== null;
    },
    computedFields() {
      return this.validity
        ? this.fields
        : this.fields.filter((field) => field.key != 'validity');
    },
  },

  methods: {
    convertTZ(date, tzString) {
      return new Date(
        (typeof date === 'string'
          ? new Date(date)
          : date
        ).toLocaleString('en-US', { timeZone: tzString })
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
    timeAgo(date, source) {
      const timeAgoInSeconds = Math.floor(
        (this.convertTZ(new Date(), 'Europe/Berlin') -
          this.convertTZ(
            new Date(date),
            source ? 'Europe/Berlin' : 'Europe/London'
          )) /
          1000
      );
      const { interval, epoch } = this.getDuration(timeAgoInSeconds);
      const suffix = interval === 1 ? '' : 's';
      return `${interval} ${epoch}${suffix} ago`;
    },
    refreshData() {
      this.currentPage = 1;
      this.$router.push({ query: {} });
      this.selected == 'all'
        ? this.getInteractions(this.currentPage)
        : this.getInteractions(this.currentPage, this.selected);
    },
    onCopy() {
      this.copiedDisplay = true;
      setTimeout(() => (this.copiedDisplay = false), 2000);
    },
    onCopyOwner() {
      this.copiedDisplayOwner = true;
      setTimeout(() => (this.copiedDisplayOwner = false), 2000);
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
        this.getInteractions(this.currentPage);
      } else {
        this.getInteractions(this.currentPage, this.selected);
      }
    },
    async getContract() {
      axios
        .get(`${this.gatewayUrl}/gateway/contracts/${this.contractId}`)
        .then((fetchedContract) => {
          this.owner = fetchedContract.data.owner;
          this.pst_ticker = fetchedContract.data.pstTicker;
          this.pst_name = fetchedContract.data.pstName;
          this.wasmLang = fetchedContract.data.srcWasmLang;
        });
    },
    async getInteractions(page, confirmationStatus) {
      this.interactions = null;
      this.total = null;

      axios
        .get(
          `${this.gatewayUrl}/gateway/interactions?contractId=${
            this.contractId
          }&limit=${this.limit}&totalCount=true&page=${page}${
            confirmationStatus
              ? `&confirmationStatus=${confirmationStatus}`
              : ''
          }`
        )
        .then(async (fetchedInteractions) => {
          if (fetchedInteractions.data.interactions.length == 0) {
            this.noInteractionsDetected = true;
          }
          this.confirmed = fetchedInteractions.data.total.confirmed;
          this.corrupted = fetchedInteractions.data.total.corrupted;
          this.paging = fetchedInteractions.data.paging;
          if (this.interactions === null) {
            this.interactions = [];
          }
          if (this.selected == 'all') {
            this.total = fetchedInteractions.data.paging.total;
          } else {
            this.total = 0;
          }
          const tagsParser = new TagsParser();
          for (const i of fetchedInteractions.data.interactions) {
            const interactionInterface = {
              cursor: '',
              node: i.interaction,
            };
            const inputFunc = JSON.parse(
              tagsParser.getInputTag(interactionInterface, this.contractId)
                .value
            ).function;
            this.interactions.push({
              id: i.interaction.id,
              validity: this.validity
                ? this.validity[
                    Object.keys(this.validity).find(
                      (v) => v == i.interaction.id
                    )
                  ]
                : null,
              interactionId: i.interaction.id,
              blockId: i.interaction.block.id,
              blockHeight: i.interaction.block.height,
              age: this.timeAgo(
                dayjs.unix(i.interaction.block.timestamp),
                i.confirming_peers == 'https://node1.bundlr.network'
              ),
              function: inputFunc ? inputFunc : '-',
              status: i.status,
              owner: i.interaction.owner.address,
              confirmingPeers: i.confirming_peers
                ? i.confirming_peers.split(',')
                : '-',
              source:
                i.confirming_peers == 'https://node1.bundlr.network'
                  ? 'sequencer'
                  : 'arweave',
              interaction: i.interaction,
              tags: tagsParser.getInputTag(
                interactionInterface,
                this.contractId
              ),
            });
          }
        });
    },
    async getInteractionValidity() {
      const validity = fetch(
        `https://cache.redstone.tools/${
          this.isTestnet ? 'testnet/' : ''
        }cache/state/${this.contractId}`
      ).then(async (res) => {
        if (res.status == 404) {
          return null;
        } else {
          const data = await res.json();
          return data.validity;
        }
      });
      return validity;
    },
    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '');
    },
  },
};
</script>

<style src="./Contract.scss" lang="scss" scoped></style>
<style lang="scss">
.contract-tabs > .tabs > div:first-of-type {
  height: 44px;
}

#confirmation-status-group {
  .custom-control-input:checked ~ .custom-control-label:after {
    background-color: var(--redstone-smartweave-blue-color) !important;
    border-color: var(--redstone-smartweave-blue-color) !important;
    border-radius: 50%;
  }
}
</style>
