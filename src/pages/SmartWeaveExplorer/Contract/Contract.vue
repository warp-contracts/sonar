<template>
  <div>
    <div v-if="correct" class="contract-wrapper">
      <NetworkLabel :network="network"></NetworkLabel>
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
                    ><a :href="`/#/app/creator/${owner}?network=${network}&dre=${activeDre[_vm.network].dre}`">{{
                      owner
                    }}</a></span
                  ><span class="d-block d-sm-none"
                    ><a :href="`/#/app/creator/${owner}?network=${network}&dre=${activeDre[_vm.network].dre}`">{{
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
                <div v-else class="pl-3 pt-3">
                  <div class="dot-flashing"></div>
                </div>
              </div>
            </div>
            <div class="cell">
              <div class="cell-header">Bundler id</div>
              <div class="d-flex">
                <div v-if="bundler_id" class="align-self-end d-flex">
                  <span class="d-none d-sm-block">{{ bundler_id }}</span
                  ><span class="d-block d-sm-none">{{ bundler_id | tx }}</span>
                  <div
                    class="flaticon-copy-to-clipboard"
                    v-clipboard="bundler_id"
                    v-clipboard:success="onCopyBundlerId"
                    title="Copy to clipboard"
                  ></div>
                  <p
                    class="clipboard-success"
                    v-bind:class="{
                      hidden: !copiedBundlerId,
                      visible: copiedBundlerId,
                    }"
                  >
                    Copied
                  </p>
                </div>
                <div v-else>N/A</div>
              </div>
            </div>
            <div class="cell">
              <div class="d-flex">
                <div class="cell-header pb-2">Contract data</div>
                <div
                  v-b-tooltip.hover
                  title="Contract data available only for contracts deployed through bundler. Either initial state if it is set in the data field by default or custom data defined by the contract developer."
                  class="flaticon-question-tooltip"
                />
              </div>
              <div v-if="!loadedContractData" class="pl-3 pt-3">
                <div class="dot-flashing"></div>
              </div>
              <div v-else>
                <div v-if="contractData">
                  <a target="_blank" :href="contractData">Link</a>
                </div>
                <div v-else class="flaticon-cross" />
              </div>
            </div>
          </div>
          <div class="col-6 p-0">
            <div class="cell">
              <div class="cell-header">Source transaction id</div>
              <div class="d-flex">
                <div v-if="sourceTxId" class="align-self-end d-flex">
                  <span class="d-none d-sm-block"
                    ><a :href="`/#/app/source/${sourceTxId}?network=${network}`">{{ sourceTxId }}</a></span
                  ><span class="d-block d-sm-none"
                    ><a :href="`/#/app/source/${sourceTxId}${network}`">{{ sourceTxId | tx }}</a></span
                  >
                  <div
                    class="flaticon-copy-to-clipboard"
                    v-clipboard="sourceTxId"
                    v-clipboard:success="onCopySourceTxId"
                    title="Copy to clipboard"
                  ></div>
                  <p
                    class="clipboard-success"
                    v-bind:class="{
                      hidden: !copiedDisplaySourceTxId,
                      visible: copiedDisplaySourceTxId,
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
              <div class="cell-header">PST Ticker</div>
              <div>{{ pst_ticker ? pst_ticker : 'N/A' }}</div>
            </div>
            <div class="cell">
              <div class="cell-header">PST Name</div>
              <div>{{ pst_name ? pst_name : 'N/A' }}</div>
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
            class="transactions-tab"
          >
            Transactions
            <b-badge variant="info" v-if="total" class="ml-2">
              <div v-if="total">{{ total }}</div>
            </b-badge>
            <b-badge variant="info" v-else-if="total == 0" class="ml-2">
              <div>0</div>
            </b-badge>

            <div v-else class="dot-flashing ml-4 mr-2"></div>
          </b-nav-item>
          <b-nav-item
            class="transactions-tab"
            :to="`?network=${network}#code`"
            :active="$route.hash === '#code'"
            @click="onInput($route.hash)"
          >
            Code
            <div v-if="wasmLang === 'loading'" class="dot-flashing ml-4 mr-2"></div>
            <b-badge v-else class="ml-2" :class="wasmLang === 'rust' ? 'rust-badge' : 'js-badge'">
              <div v-if="wasmLang">{{ wasmLang }}</div>
              <div v-else>JS</div>
            </b-badge>
          </b-nav-item>
          <b-nav-item
            :to="`?network=${network}#state`"
            :active="$route.hash === '#state'"
            @click="onInput($route.hash)"
          >
            Initial State
          </b-nav-item>
          <b-nav-item
            :to="`?network=${network}#current-state`"
            :active="$route.hash === '#current-state'"
            @click="onInput($route.hash)"
            class="state-evaluated-tab"
          >
            State Evaluated
            <b-badge variant="light">
              <div v-if="loadedState">
                <div v-if="dre_status == 'evaluated'" class="flaticon-check" />
                <div v-else class="flaticon-cross" />
              </div>
              <div v-else class="pl-3">
                <div class="dot-flashing mr-1"></div>
              </div>
            </b-badge>
          </b-nav-item>

          <b-nav-item :to="`?network=${network}#tags`" :active="$route.hash === '#tags'" @click="onInput($route.hash)">
            Tags
          </b-nav-item>
        </b-nav>
        <div class="tab-content">
          <div :class="['tab-pane', { active: $route.hash === '#' || $route.hash === '' }]" class="p-2">
            <div v-if="!noInteractionsDetected">
              <div class="d-block d-sm-flex justify-content-end">
                <b-button
                  class="btn btn-refresh d-flex justify-content-center align-items-center rounded-pill mb-3"
                  @click="refreshData"
                  ><p class="m-0" v-if="interactionsLoaded">Refresh data</p>
                  <div v-else>
                    <div class="dot-flashing"></div>
                  </div>
                </b-button>
              </div>
              <div>
                <TxList :paging="pages" v-if="interactionsLoaded" @page-clicked="onPageClicked">
                  <b-table
                    v-if="interactions?.length > 0"
                    ref="table"
                    id="interactions-table"
                    stacked="md"
                    hover
                    :items="interactions"
                    :fields="fields"
                    @row-clicked="rowClicked"
                    :busy="!interactionsLoaded"
                  >
                    <template #table-busy></template>

                    <template #cell(id)="data">
                      <div class="d-flex">
                        <a
                          :href="`/#/app/interaction/${data.item.interactionId}?network=${network}&dre=${
                            activeDre[_vm.network].dre
                          }`"
                        >
                          {{ data.item.interactionId | tx }}</a
                        >
                        <div
                          class="flaticon-copy-to-clipboard small"
                          v-clipboard="data.item.interactionId"
                          v-clipboard:success="({ event }) => event.stopPropagation()"
                          title="Copy to clipboard"
                        ></div>
                      </div>
                    </template>

                    <template #cell(bundlerId)="data">
                      <div class="d-flex" v-if="data.item.bundlerTxId">
                        <a
                          :href="`${
                            daysAgo(data.item.timestamp) > 1
                              ? `https://viewblock.io/arweave/tx/${data.item.bundlerTxId}`
                              : `https://arweave.net/${data.item.bundlerTxId}`
                          }`"
                          target="_blank"
                          >{{ data.item.bundlerTxId | tx }}</a
                        >
                        <div
                          class="flaticon-copy-to-clipboard small"
                          v-clipboard="data.item.bundlerTxId"
                          v-clipboard:success="({ event }) => event.stopPropagation()"
                          title="Copy to clipboard"
                        ></div>
                      </div>
                      <span v-else>N/A</span>
                    </template>

                    <template #cell(validity)="data">
                      <div
                        v-show="loadedValidity && validity && validity[data.item.interactionId] == true"
                        class="flaticon-check centered"
                      />
                      <div
                        v-show="loadedValidity && validity && validity[data.item.interactionId] == false"
                        class="flaticon-cross centered"
                      />
                      <div
                        v-if="loadedValidity && validity && !(data.item.interactionId in validity)"
                        class="text-center"
                      >
                        N/A
                      </div>
                      <div v-show="loadedValidity && !validity" class="text-center">N/A</div>
                      <div v-show="!loadedValidity" class="dot-flashing centered"></div>
                    </template>

                    <template #cell(block_height)="data">
                      <a :href="`https://viewblock.io/arweave/block/${data.item.blockId}`" target="_blank">
                        {{ data.item.blockHeight }}
                      </a>
                    </template>

                    <template #cell(creator)="data">
                      <a
                        :href="`#/app/creator/${data.item.owner}?network=${network}&dre=${activeDre[_vm.network].dre}`"
                      >
                        {{ data.item.owner | tx }}</a
                      >
                      <!-- <span v-else> {{ data.item.owner | tx }}</span> -->
                    </template>

                    <template #cell(function)="data">
                      {{ data.item.function }}
                    </template>

                    <template #cell(actions)="data">
                      <div v-if="!data.item._showDetails" class="flaticon-chevron-down" />
                      <div v-else class="flaticon-chevron-up" />
                    </template>

                    <template #head(validity)>
                      <div class="d-flex justify-content-center align-items-center">
                        <p class="m-0 align-bottom">valid</p>
                        <div
                          v-b-tooltip.hover
                          title="Validity only available for evaluated contracts."
                          class="flaticon-question-tooltip"
                        />
                      </div>
                    </template>

                    <template slot="row-details" slot-scope="data">
                      <div class="tx-error-message-container" v-if="errorMessages">
                        <div v-show="validity && errorMessages[data.item.interactionId]">
                          <p class="tx-error-message">
                            Error: <span>{{ errorMessages[data.item.interactionId] }}</span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <p class="json-header">Contract Input:</p>
                        <json-viewer :value="data.item.tags" :expand-depth="1" copyable sort theme="json-theme">
                          <template v-slot:copy>
                            <img
                              v-b-tooltip.hover
                              title="Copy JSON data"
                              src="@/assets/icons/copy-to-clipboard.svg"
                              class="jviewer-copy-icon"
                              alt="copy icon"
                            /> </template
                        ></json-viewer>
                        <hr />
                        <p class="json-header">Full transaction:</p>
                        <json-viewer :value="data.item.interaction" :expand-depth="1" copyable sort theme="json-theme">
                          <template v-slot:copy>
                            <img
                              v-b-tooltip.hover
                              title="Copy JSON data"
                              src="@/assets/icons/copy-to-clipboard.svg"
                              class="jviewer-copy-icon"
                              alt="copy icon"
                            /> </template
                        ></json-viewer>
                      </div>
                    </template>
                  </b-table>
                </TxList>
                <div v-if="!interactionsLoaded">
                  <div v-for="n in 15" :key="n" class="preloader text-preloader tx-preloader"></div>
                </div>
              </div>
            </div>
            <div v-else class="interactions-wrapper">Contract has no interactions!</div>
          </div>
          <div :class="['tab-pane', { active: $route.hash === '#code' }]" class="p-2">
            <div v-if="visitedTabs.includes('#code')">
              <ContractCode
                v-if="loadedContract"
                :contractId="contractId"
                :sourceId="sourceTxId"
                :wasm="!!wasmLang"
                :source="codeSource"
              ></ContractCode>
              <div v-else class="d-flex align-items-center flex-column pt-5">
                <LoadingSpinner></LoadingSpinner>
                <p>Loading contract code...</p>
              </div>
            </div>
          </div>
          <div :class="['tab-pane', { active: $route.hash === '#state' }]" class="p-2">
            <div>
              <ContractState v-if="initState" :contractId="contractId" :initState="initState"></ContractState>
            </div>
          </div>
          <div :class="['tab-pane', { active: $route.hash === '#current-state' }]" class="p-2">
            <div>
              <ContractCurrentState
                v-if="currentState"
                :contractId="contractId"
                :currentState="currentState"
                :timestamp="dre_timestamp"
                :sortKey="dre_sortKey"
                :signature="dre_signature"
                :stateHash="dre_stateHash"
                :manifest="dre_manifest"
              ></ContractCurrentState>
              <div v-else-if="!currentState && dre_evaluationError">
                <span v-if="dre_status == 'blacklisted'" class="blacklist-error">Contract blacklisted</span>
                <json-viewer
                  class="mt-4"
                  :value="dreErrors[0]"
                  :expand-depth="1"
                  copyable
                  sort
                  theme="json-theme"
                ></json-viewer>
              </div>
              <div v-else-if="!loadedState">Loading...</div>
              <div v-else-if="loadedState && !currentState && !dre_evaluationError">
                <p class="text-break">
                  State is evaluated for contracts which are registered as safe (which do not use unsafeClient). If
                  contracts perform internal reads or internal writes on unsafe contracts, these interactions are
                  skipped during the evaluation process. Please contact us to get the instruction on how to submit the
                  contract for evaluation. State is evaluated for contracts which are registered as safe (which do not
                  do not use unsafeClient). If contracts perform internal reads or internal writes on unsafe contracts,
                  these interactions are skipped during the evaluation process. Please contact us to get the instruction
                  on how to submit the contract for evaluation.
                </p>
              </div>
            </div>
          </div>

          <div :class="['tab-pane', { active: $route.hash === '#tags' }]" class="p-2">
            <div>
              <ContractTags :contractTags="tags"></ContractTags>
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
import { TagsParser } from 'warp-contracts';
import JsonViewer from 'vue-json-viewer';
import ContractCode from './ContractCode/ContractCode';
import ContractState from './ContractState/ContractState';
import ContractCurrentState from './ContractCurrentState/ContractCurrentState';
import dayjs from 'dayjs';
import Error from '@/components/Error/Error';
import { mapMutations, mapState } from 'vuex';
import constants from '@/constants';
import ContractTags from './ContractTags/ContractTags.vue';
import { interactionTagsParser } from '@/utils';
import NetworkLabel from '../../../components/NetworkLabel.vue';
import { convertTime } from '@/utils';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

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
          label: 'valid',
          thClass: 'text-center',
        },
        'function',
        'creator',
        'age',
        'block_height',
        'bundlerId',
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
      copiedDisplaySourceTxId: false,
      copiedDisplayInteraction: [],
      copiedBundlerId: false,
      loadingInitialized: false,
      correct: false,
      pst_ticker: null,
      pst_name: null,
      bundler_id: null,
      noInteractionsDetected: false,
      wasmLang: 'loading',
      initState: null,
      currentState: null,
      loadedValidity: true,
      loadedState: true,
      loadedContract: null,
      validity: false,
      axiosSource: null,
      sourceTxId: null,
      loadedContractData: false,
      contractData: null,
      errorMessages: null,
      dre_sortKey: null,
      dre_timestamp: null,
      dre_signature: null,
      dre_stateHash: null,
      dre_manifest: null,
      dre_status: null,
      dre_evaluationError: null,
      tags: [],
      // for code tab
      codeSource: null,
      evolvedSrc: null,
      initSrc: null,
      dreErrors: null,
    };
  },
  watch: {
    contractId: function () {
      this.$router.go(0);
    },
  },
  async created() {
    this.$vueEventBus.$on('changeActiveDre', async (data) => {
      await this.getDreState();
    });
  },
  beforeUnmount() {
    this.$vueEventBus.$off('changeActiveDre');
  },
  async mounted() {
    if (this.$route.params.id.length != 43) {
      this.correct = false;
    } else {
      this.correct = true;
    }
    this.getInteractions(this.$route.query.page ? this.$route.query.page : this.currentPage);
    this.getContract();
    await this.getContractData();
    this.visitedTabs.push(this.$route.hash);
    await this.getDreState();
  },

  components: {
    TxList,
    JsonViewer,
    Error,
    ContractState,
    ContractCurrentState,
    ContractCode,
    ContractTags,
    NetworkLabel,
    LoadingSpinner,
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'network']),
    ...mapState('drestatus', ['activeDre']),
    contractId() {
      return this.$route.params.id;
    },
    pages() {
      return this.paging ? this.paging : null;
    },
    interactionsLoaded() {
      return this.interactions !== null && this.total !== null;
    },
    shownErrorMessages() {
      const errorIds = Object.keys(this.errorMessages.value);

      return errorIds
        .map((errorId, index) => {
          const isRelatedFieldExists = this.interactions.value.find(({ id }) => id === errorId);

          if (isRelatedFieldExists) {
            return errorId;
          }
        })
        .filter(Boolean);
    },
  },

  methods: {
    ...mapMutations('source', ['setSource']),

    async getContractData() {
      axios
        .get(`${this.gatewayUrl}/gateway/contract-data/${this.contractId}`)
        .then((contractData) => {
          this.loadedContractData = true;
          this.contractData = `${this.gatewayUrl}/gateway/contract-data/${this.contractId}`;
        })
        .catch((e) => {
          this.loadedContractData = true;
          this.contract = null;
        });
    },
    daysAgo(timestamp) {
      const difference = Math.trunc(+Date.now() / 1000) - timestamp;
      const daysDifference = Math.floor(difference / 60 / 60 / 24);

      return daysDifference;
    },
    refreshData() {
      this.currentPage = 1;
      this.$router.push(`/app/contracts?network=${this.network}`);
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
    onCopySourceTxId() {
      this.copiedDisplaySourceTxId = true;
      setTimeout(() => (this.copiedDisplaySourceTxId = false), 2000);
    },
    onCopyBundlerId() {
      this.copiedBundlerId = true;
      setTimeout(() => (this.copiedBundlerId = false), 2000);
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
        await this.getDreValidityAndErrorMessages();
      } else {
        this.getInteractions(this.currentPage, this.selected);
        await this.getDreValidityAndErrorMessages();
      }
    },

    async getContract() {
      try {
        const response = await fetch(`${this.gatewayUrl}/gateway/v2/contract?txId=${this.contractId}`);
        if (!response.ok) {
          this.correct = false;
        }
        const data = await response.json();
        this.codeSource = {
          srcTxId: data.srcTxId,
          src: data.src,
          srcBinary: data.srcBinary,
          srcWasmLang: data.srcWasmLang,
          blockTimestamp: data.blockTimestamp,
          evolvedSrc: data.evolvedSrc,
        };

        if (data.contractTx == null || data.contractTx.tags == null) {
          this.tags = null;
        } else {
          this.tags = await interactionTagsParser(data.contractTx);
        }
        this.owner = data.owner;
        this.pst_ticker = data.pstTicker;
        this.pst_name = data.pstName;
        this.wasmLang = data.srcWasmLang;
        this.initState = data.initState;
        this.sourceTxId = data.evolvedSrc[0]?.srcTxId ? data.evolvedSrc[0].srcTxId : data.srcTxId;
        this.bundler_id = data.bundlerTxId;

        this.loadedContract = true;
      } catch (err) {
        this.correct = false;
        console.error(err);
      }
    },

    async getInteractions(page, confirmationStatus) {
      if (this.axiosSource) {
        this.axiosSource.cancel('Cancel previous request');
      }
      const CancelToken = axios.CancelToken;
      this.axiosSource = CancelToken.source();

      this.interactions = null;
      this.total = null;

      axios
        .get(
          `${this.gatewayUrl}/gateway/interactions-sonar?contractId=${this.contractId}&limit=${
            this.limit
          }&totalCount=true&page=${page}${confirmationStatus ? `&confirmationStatus=${confirmationStatus}` : ''}`
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
          this.total = fetchedInteractions.data.paging.total;
          const tagsParser = new TagsParser();
          for (const i of fetchedInteractions.data.interactions) {
            const inputFunc = JSON.parse(tagsParser.getInputTag(i.interaction, this.contractId).value).function;
            const isBundled =
              i.confirming_peers == 'https://node2.bundlr.network' ||
              i.confirming_peers == 'https://node1.bundlr.network';

            this.interactions.push({
              id: i.interaction.id,
              interactionId: i.interaction.id,
              blockId: i.interaction.block.id,
              blockHeight: i.interaction.block.height,
              timestamp: i.interaction.block.timestamp,
              age: convertTime(
                dayjs.unix(i.interaction.block.timestamp),
                isBundled ? dayjs.unix(Math.trunc(i.interaction.sortKey.split(',')[1] / 1000)) : null
              ),
              function: inputFunc ? inputFunc : '-',
              status: i.status,
              owner: i.interaction.owner.address,
              interaction: i.interaction,
              tags: tagsParser.getInputTag(i.interaction, this.contractId),
              bundlerTxId: i.interaction.bundlerTxId,
            });
          }
        });
    },
    async getDreValidityAndErrorMessages() {
      this.loadedValidity = false;
      const response = await fetch(
        `${this.activeDre[this.network].link}/contract?id=${this.contractId}&validity=true&errorMessages=true&page=${
          this.currentPage
        }&limit=15`
      );

      if (response.status != 200) {
        this.loadedValidity = true;
        return;
      }
      const data = await response.json();

      if (data.validity && Object.keys(data.validity).length > 0) {
        this.validity = data.validity;
      } else {
        this.validity = false;
      }

      this.errorMessages = data.errorMessages;

      this.loadedValidity = true;
    },
    async getDreState() {
      this.loadedState = false;
      this.loadedValidity = false;
      this.validity = false;
      const response = await fetch(
        `${this.activeDre[this.network].link}/contract?id=${this.contractId}&validity=true&errorMessages=true&page=${
          this.currentPage || 1
        }&limit=15`
      );
      if (response.status != 200) {
        this.loadedState = true;
        this.loadedValidity = true;
        return;
      }
      const data = await response.json();
      if (data.state === undefined) {
        this.currentState = null;
      } else {
        this.currentState = data.state;
      }
      if (data.validity && Object.keys(data.validity).length > 0) {
        this.validity = data.validity;
      }

      this.dre_sortKey = data.sortKey;
      this.errorMessages = data.errorMessages;
      this.dre_timestamp = data.timestamp;
      this.dre_signature = data.signature;
      this.dre_stateHash = data.stateHash;
      this.dre_manifest = data.manifest;
      this.dre_status = data.status;

      if (data.status == 'error' || data.status == 'blacklisted') {
        this.dre_evaluationError = data.errors[0].failure;
        this.dreErrors = data.errors;
      }
      this.loadedValidity = true;
      this.loadedState = true;
    },

    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '');
    },
  },
};
</script>

<style src="./Contract.scss" lang="scss" scoped></style>
<style lang="scss" scoped>
.contract-tabs > .tabs > div:first-of-type {
  height: 44px;
}

.table thead th:nth-of-type(2),
.table thead th:nth-of-type(5),
.table thead th:nth-of-type(6) {
  width: 10%;
}

.btn-refresh {
  min-width: 163px;
  min-height: 42px;
}

#confirmation-status-group {
  .custom-control-input:checked ~ .custom-control-label:after {
    background-color: var(--warp-blue-color) !important;
    border-color: var(--warp-blue-color) !important;
    border-radius: 50%;
  }
}

.tx-error-message {
  font-size: 0.8rem;
  color: red;
}

.blacklist-error {
  background-color: rgba(0, 0, 0, 0.142);
  color: black;
  padding: 0.5rem;
  border-radius: 50rem;
}
.state-evaluated-tab > a,
.transactions-tab > a {
  display: flex;
  align-items: center;
}

.rust-badge {
  background-color: rgb(209, 137, 4) !important;
  color: white;
}

.js-badge {
  background-color: rgb(232, 232, 9);
  color: black;
}
::v-deep #interactions-table thead th {
  vertical-align: middle;
}
.tab-content {
  min-height: 30vh;
}

@media (min-width: 1600px) {
  .tab-content {
    min-height: 45vh;
  }
}
</style>
