<template>
  <div :key="interactionId">
    <div v-if="correct" class="contract-wrapper">
      <div class="d-block d-sm-flex pl-2">
        <div class="contract-header-wrapper">
          <div class="flaticon-interaction"></div>
          <div class="align-self-end contract-header">Interaction</div>
        </div>
        <div class="align-self-end pl-3 contract-id d-flex">
          <span class="d-none d-sm-block">{{ interactionId }}</span
          ><span class="d-block d-sm-none">{{ interactionId | tx }}</span>
          <div
            class="flaticon-copy-to-clipboard"
            v-clipboard="interactionId"
            v-clipboard:success="onCopy"
            title="Copy to clipboard"
          ></div>
          <p class="clipboard-success" v-bind:class="{ hidden: !copiedDisplay, visible: copiedDisplay }">Copied</p>
        </div>
      </div>
      <div class="row">
        <div v-if="loaded" class="pl-3 col-lg-7 col-12 info-container">
          <div class="interaction-item">
            <div>Contract id</div>
            <a :href="`/#/app/contract/${interaction?.contractId}`">
              <span class="d-none d-sm-block">{{ interaction?.contractId }}</span
              ><span class="d-block d-sm-none">{{ interaction?.contractId | tx }}</span>
            </a>
            <div
              class="flaticon-copy-to-clipboard"
              v-clipboard="interaction?.contractId"
              v-clipboard:success="onCopyContractId"
              title="Copy to clipboard"
            ></div>
            <p
              class="clipboard-success"
              v-bind:class="{
                hidden: !copiedContractIdDisplay,
                visible: copiedContractIdDisplay,
              }"
            >
              Copied
            </p>
          </div>
          <div class="interaction-item">
            <div>Creator</div>
            <a v-if="!isTestnet" :href="`#/app/creator/${interaction.interaction?.owner.address}`">
              <span class="d-none d-sm-block">{{ interaction.interaction?.owner.address }}</span
              ><span class="d-block d-sm-none">{{ interaction.interaction?.owner.address | tx }}</span>
            </a>
            <div v-else>
              <span class="d-none d-sm-block">{{ interaction.interaction?.owner.address }}</span
              ><span class="d-block d-sm-none">{{ interaction.interaction?.owner.address | tx }}</span>
            </div>
            <div
              class="flaticon-copy-to-clipboard"
              v-clipboard="interaction.interaction?.owner.address"
              v-clipboard:success="onCopyCreator"
              title="Copy to clipboard"
            ></div>
            <p
              class="clipboard-success"
              v-bind:class="{ hidden: !copiedDisplayCreator, visible: copiedDisplayCreator }"
            >
              Copied
            </p>
          </div>
          <div class="interaction-item">
            <div>Bundler id</div>
            <div v-if="interaction.bundlerTxId">
              <a
                :href="`${
                  daysAgo(interaction.timestamp) > 1
                    ? `https://v2.viewblock.io/arweave/tx/${interaction.bundlerTxId}`
                    : `https://arweave.net/${interaction.bundlerTxId}`
                }`"
                target="_blank"
                class="d-none d-sm-block"
                >{{ interaction.bundlerTxId }}</a
              ><a
                :href="`${
                  daysAgo(interaction.timestamp) > 1
                    ? `https://v2.viewblock.io/arweave/tx/${interaction.bundlerTxId}`
                    : `https://arweave.net/${interaction.bundlerTxId}`
                }`"
                target="_blank"
                class="d-block d-sm-none"
                >{{ interaction.bundlerTxId | tx }}</a
              >
            </div>
            <div v-else>N/A</div>
            <div
              class="flaticon-copy-to-clipboard"
              v-clipboard="interaction?.bundlerTxId"
              v-clipboard:success="onCopyBundlerId"
              title="Copy to clipboard"
            ></div>
            <p
              class="clipboard-success"
              v-bind:class="{ hidden: !copiedDisplayBundlerId, visible: copiedDisplayBundlerId }"
            >
              Copied
            </p>
          </div>
          <div class="interaction-item">
            <div>Sort key</div>
            <div style="word-break: break-all">
              {{ interaction.sortKey ? interaction.sortKey : '-' }}
            </div>
          </div>
          <div class="interaction-item">
            <div>Confirmation status</div>
            <div>{{ interaction.confirmationStatus }}</div>
          </div>
          <div class="interaction-item">
            <div>Confirming peers</div>
            <div v-if="interaction.confirmingPeer && interaction.confirmingPeer[0] != '-'">
              <a
                :href="`${
                  interaction.source && interaction.source == 'arweave'
                    ? `${interaction.confirmingPeer[0]}/tx/${interaction.bundlerTxId}/status`
                    : `https://node1.bundlr.network`
                }`"
                target="_blank"
                class="mr-1"
              >
                {{ interaction.confirmingPeer[0] }}</a
              >
              <a
                :href="`${
                  interaction.source && interaction.source == 'arweave'
                    ? `http://${interaction.confirmingPeer[0]}/tx/${interaction.bundlerTxId}/status`
                    : `https://node1.bundlr.network`
                }`"
                target="_blank"
                class="mr-1"
              >
                {{ interaction.confirmingPeer[1] }}</a
              >
              <a
                :href="`${
                  interaction.source && interaction.source == 'arweave'
                    ? `http://${interaction.confirmingPeer[0]}/tx/${interaction.bundlerTxId}/status`
                    : `https://node1.bundlr.network`
                }`"
                target="_blank"
                class="mr-1"
              >
                {{ interaction.confirmingPeer[2] }}</a
              >
            </div>
            <div v-else>N/A</div>
          </div>
          <div class="interaction-item">
            <div>Function</div>
            <div>{{ interaction.func }}</div>
          </div>
          <div v-if="interaction">
            <p class="json-header">Input Value</p>
            <json-viewer
              :value="interaction.interactionValue"
              :expand-depth="2"
              copyable
              sort
              theme="json-theme"
            ></json-viewer>
          </div>
          <div class="vrf-container" v-if="interaction.vrf">
            <p class="json-header">VRF</p>
            <json-viewer :value="interaction.vrf" :expand-depth="2" copyable sort theme="json-theme"></json-viewer>
          </div>
          <div class="interaction-item" v-if="interaction.pstQty">
            <div>PST transfer qty</div>
            <div>{{ interaction.pstQty }}</div>
          </div>
          <div class="interaction-item">
            <div>Block height</div>
            <div>{{ interaction.blockHeight }}</div>
          </div>
          <div class="interaction-item">
            <div>Block id</div>
            <a
              :href="`${
                isTestnet
                  ? `https://testnet.redstone.tools/block/hash/${interaction.blockId}`
                  : `https://v2.viewblock.io/arweave/block/${interaction.blockId}`
              }`"
              target="_blank"
            >
              <span class="d-none d-sm-block">{{ interaction?.blockId }}</span
              ><span class="d-block d-sm-none">{{ interaction?.blockId | tx }}</span>
            </a>
          </div>
          <div class="interaction-item">
            <div>Recipient</div>
            <div>{{ interaction.recipient }}</div>
          </div>
          <div class="interaction-item">
            <div>Timestamp</div>
            <div>{{ interaction.timestamp }} ({{ interaction.timestampFormatted }})</div>
          </div>
          <div class="interaction-item">
            <div>Fee</div>
            <div>
              {{ interaction.fee }} ({{ interaction.feeInAr }} AR /
              <a href="https://app.redstone.finance/#/app/token/AR" target="_blank">${{ interaction.feeInUsd }}</a
              >)
            </div>
          </div>
          <div class="interaction-item">
            <div>Quantity</div>
            <div>{{ interaction.interaction?.quantity.winston }}</div>
          </div>
        </div>
        <div class="pl-3 col-lg-7 col-12 info-container" v-if="!loaded">
          <div v-for="n in 11" :key="n" class="preloader text-preloader tx-preloader"></div>
        </div>
        <div class="col-lg-5 col-12 pt-4">
          <div v-if="interaction">
            <p class="json-header">Interaction Tags</p>
            <json-viewer v-if="!loaded" :value="''" :expand-depth="2" copyable sort theme="json-theme"></json-viewer>
            <json-viewer v-else :value="interaction.tags" :expand-depth="2" copyable sort theme="json-theme"></json-viewer>
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
import JsonViewer from 'vue-json-viewer';
import dayjs from 'dayjs';
import Error from '@/components/Error/Error';
import redstone from 'redstone-api';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { mapState } from 'vuex';
import { TagsParser } from 'warp-contracts';

dayjs.extend(localizedFormat);
dayjs.extend(utc);

export default {
  name: 'Contract',

  data() {
    return {
      visitedTabs: [],
      interaction: {},
      epochs: [
        ['year', 31536000],
        ['month', 2592000],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
        ['second', 1],
      ],
      interactions: [],
      currentPage: 1,
      paging: null,
      total: 0,
      confirmed: 0,
      corrupted: 0,
      limit: 15,
      selected: 'all',
      copiedDisplay: false,
      copiedContractIdDisplay: false,
      copiedDisplayCreator: false,
      copiedDisplayBundlerId: false,
      loaded: false,
      winstonToAR: 0.000000000001,
      correct: false,
      usdPrice: 0,
      qty: 0,
    };
  },

  async mounted() {
    await this.loadInteractionData();
  },
  watch: {
    interactionId: function () {
      this.loadInteractionData();
    },
  },
  components: { JsonViewer, Error },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'isTestnet']),
    interactionId() {
      return this.$route.params.id;
    },
    pages() {
      return this.paging ? this.paging : null;
    },
    interactionsLoaded() {
      return (
        this.interactions &&
        this.total &&
        this.interactions.length == (this.paging.items > this.limit ? this.limit : this.paging.items)
      );
    },
  },

  methods: {
    async loadInteractionData() {
      if (this.$route.params.id.length != 43) {
        this.correct = false;
      } else {
        this.correct = true;
      }
      const { symbols } = redstone;
      const price = await redstone.getPrice('AR');
      const { value } = price;
      this.usdPrice = value;
      this.getInteraction(this.$route.query.page ? this.$route.query.page : this.currentPage);
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
    onCopy() {
      this.copiedDisplay = true;
      setTimeout(() => (this.copiedDisplay = false), 2000);
    },
    onCopyContractId() {
      this.copiedContractIdDisplay = true;
      setTimeout(() => (this.copiedContractIdDisplay = false), 2000);
    },
    onCopyCreator() {
      this.copiedDisplayCreator = true;
      setTimeout(() => (this.copiedDisplayCreator = false), 2000);
    },
    onCopyBundlerId() {
      this.copiedDisplayBundlerId = true;
      setTimeout(() => (this.copiedDisplayBundlerId = false), 2000);
    },
    async getInteraction() {
      this.interactions = [];
      axios
        .get(`${this.gatewayUrl}/gateway/interactions/${this.interactionId}`)

        .then((fetchedInteractions) => {
          const tagsParser = new TagsParser();

          const interactionInterface = {
            cursor: '',
            node: fetchedInteractions.data.interaction,
          };
          this.correct = true;
          this.correct = !_.isEmpty(fetchedInteractions.data);
          this.interaction = {
            id: fetchedInteractions.data.interactionid,
            bundlerTxId: fetchedInteractions.data.bundlertxid,
            interaction: fetchedInteractions.data.interaction,
            blockId: fetchedInteractions.data.blockid,
            blockHeight: fetchedInteractions.data.blockheight,
            contractId: fetchedInteractions.data.contractid,
            func: fetchedInteractions.data.function,
            pstQty: JSON.parse(fetchedInteractions.data.interaction.tags.find((t) => t.name == 'Input').value).qty,
            confirmationStatus: fetchedInteractions.data.confirmationstatus,
            confirmingPeer: fetchedInteractions.data.confirmingpeer
              ? fetchedInteractions.data.confirmingpeer.split(',')
              : '-',
            sortKey: fetchedInteractions.data.sortkey,
            source: fetchedInteractions.data.confirmingpeer == 'https://node1.bundlr.network' ? 'sequencer' : 'arweave',
            confirmedAtHeight: fetchedInteractions.data.confirmedAtHeight,
            tags: fetchedInteractions.data.interaction.tags,
            interactionValue: JSON.parse(tagsParser.getInputTag(interactionInterface, this.contractId).value),
            timestamp: fetchedInteractions.data.interaction.block.timestamp,
            timestampFormatted: dayjs
              .utc(dayjs.unix(fetchedInteractions.data.interaction.block.timestamp))
              .local()
              .format('ddd, DD MMM YYYY, HH:mm:ss ZZ'),
            fee: fetchedInteractions.data.interaction.fee.winston,
            feeInAr: (fetchedInteractions.data.interaction.fee.winston * this.winstonToAR).toFixed(8),
            feeInUsd: (fetchedInteractions.data.interaction.fee.winston * this.winstonToAR * this.usdPrice).toFixed(4),
            vrf: fetchedInteractions.data.interaction.vrf,
            recipient:
              fetchedInteractions.data.interaction.recipient == ''
                ? 'N/A'
                : fetchedInteractions.data.interaction.recipient,
          };
          this.loaded = true;
        })
        .catch((e) => {
          this.correct = false;
        });
    },
    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '');
    },
  },
};
</script>

<style src="./Interaction.scss" lang="scss" scoped></style>
<style lang="scss">
.contract-tabs > .tabs > div:first-of-type {
  height: 44px;
}

.contract-tabs {
  .nav-tabs > .nav-item {
    flex: 0 0 124px !important;
  }
}

.vrf-container {
  margin-top: 20px;
  margin-bottom: 20px;
}

.info-container {
  margin-top: 50px;
}
</style>
