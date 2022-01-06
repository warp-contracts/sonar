<template>
  <div>
    <div v-if="loadingInitialized && correct" class="contract-wrapper">
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
          <p
            class="clipboard-success"
            v-bind:class="{ hidden: !copiedDisplay, visible: copiedDisplay }"
          >
            Copied
          </p>
        </div>
      </div>
      <div class="row">
        <div
          v-if="loaded"
          style="marginTop: 50px;"
          class="pl-3 col-lg-7 col-12"
        >
          <div class="interaction-item">
            <div>Owner</div>
            <a
              :href="
                `https://viewblock.io/arweave/address/${interaction.interaction?.owner.address}`
              "
              target="_blank"
            >
              <span class="d-none d-sm-block">{{
                interaction.interaction?.owner.address
              }}</span
              ><span class="d-block d-sm-none">{{
                interaction.interaction?.owner.address | tx
              }}</span>
            </a>
          </div>
          <div class="interaction-item">
            <div>Confirmation status</div>
            <div>{{ interaction.confirmationStatus }}</div>
          </div>
          <div class="interaction-item">
            <div>Confirming peers</div>
            <div
              v-if="
                interaction.confirmingPeer &&
                  interaction.confirmingPeer[0] != '-'
              "
            >
              <a
                :href="
                  `http://${interaction.confirmingPeer[0]}:1984/tx/${interaction.id}/status`
                "
                target="_blank"
                class="mr-1"
              >
                {{ interaction.confirmingPeer[0] }}</a
              >
              <a
                :href="
                  `http://${interaction.confirmingPeer[1]}:1984/tx/${interaction.id}/status`
                "
                target="_blank"
                class="mr-1"
              >
                {{ interaction.confirmingPeer[1] }}</a
              >
              <a
                :href="
                  `http://${interaction.confirmingPeer[2]}:1984/tx/${interaction.id}/status`
                "
                target="_blank"
                class="mr-1"
              >
                {{ interaction.confirmingPeer[2] }}</a
              >
            </div>
            <div v-else>{{ interaction.confirmingPeer }}</div>
          </div>
          <div class="interaction-item">
            <div>Contract id</div>
            <a :href="`/#/app/contract/${interaction?.contractId}`">
              <span class="d-none d-sm-block">{{
                interaction?.contractId
              }}</span
              ><span class="d-block d-sm-none">{{
                interaction?.contractId | tx
              }}</span>
            </a>
          </div>
          <div class="interaction-item">
            <div>Function</div>
            <div>{{ interaction.func }}</div>
          </div>
          <div class="interaction-item">
            <div>Block height</div>
            <div>{{ interaction.blockHeight }}</div>
          </div>
          <div class="interaction-item">
            <div>Block id</div>
            <a
              :href="
                `https://viewblock.io/arweave/block/${interaction.blockId}`
              "
              target="_blank"
            >
              <span class="d-none d-sm-block">{{ interaction?.blockId }}</span
              ><span class="d-block d-sm-none">{{
                interaction?.blockId | tx
              }}</span>
            </a>
          </div>
          <div class="interaction-item">
            <div>Recipient</div>
            <div>{{ interaction.recipient }}</div>
          </div>
          <div class="interaction-item">
            <div>Timestamp</div>
            <div>
              {{ interaction.timestamp }} ({{ interaction.timestampFormatted }})
            </div>
          </div>
          <div class="interaction-item">
            <div>Fee</div>
            <div>{{ interaction.fee }} ({{ interaction.feeInAr }} AR)</div>
          </div>
          <div class="interaction-item">
            <div>Quantity</div>
            <div>{{ interaction.interaction?.quantity.winston }}</div>
          </div>
        </div>
        <div
          class="pl-3 col-lg-7 col-12"
          style="marginTop: 50px;"
          v-if="!loaded"
        >
          <div
            v-for="n in 11"
            :key="n"
            class="preloader text-preloader tx-preloader"
          ></div>
        </div>
        <div class="col-lg-5 col-12 pt-4">
          <div v-if="interaction">
            <p class="json-header">Interaction Tags</p>
            <json-viewer
              :value="interaction.tags"
              :expand-depth="2"
              copyable
              sort
            ></json-viewer>
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
import _ from "lodash";
import axios from "axios";
import JsonViewer from "vue-json-viewer";
import dayjs from "dayjs";
import constants from "@/constants";
import Error from "@/components/Error/Error";

export default {
  name: "Contract",

  data() {
    return {
      visitedTabs: [],
      interaction: {},
      epochs: [
        ["year", 31536000],
        ["month", 2592000],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
        ["second", 1],
      ],
      interactions: [],
      currentPage: 1,
      paging: null,
      total: 0,
      confirmed: 0,
      corrupted: 0,
      limit: 15,
      selected: "all",
      copiedDisplay: false,
      copiedDisplayOwner: false,
      loaded: false,
      winstonToAR: 0.000000000001,
      correct: false,
      loadingInitialized: false,
    };
  },

  mounted() {
    if (this.$route.params.id.length != 43) {
      this.loadingInitialized = true;
      this.correct = false;
    }
    this.getInteraction(
      this.$route.query.page ? this.$route.query.page : this.currentPage
    );
  },

  components: { JsonViewer, Error },
  computed: {
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
        this.interactions.length ==
          (this.paging.items > this.limit ? this.limit : this.paging.items)
      );
    },
  },

  watch: {},
  methods: {
    convertTZ(date, tzString) {
      return new Date(
        (typeof date === "string"
          ? new Date(date)
          : date
        ).toLocaleString("en-US", { timeZone: tzString })
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
        (this.convertTZ(new Date(), "Europe/Berlin") -
          this.convertTZ(new Date(date), "Europe/London")) /
          1000
      );
      const { interval, epoch } = this.getDuration(timeAgoInSeconds);
      const suffix = interval === 1 ? "" : "s";
      return `${interval} ${epoch}${suffix} ago`;
    },
    refreshData() {
      this.currentPage = 1;
      this.$router.push({ query: {} });
      this.selected == "all"
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
    async getInteraction() {
      this.interactions = [];
      axios
        .get(
          `${constants.gatewayUrl}/gateway/interactions/${this.interactionId}`
        )

        .then((fetchedInteractions) => {
          this.loadingInitialized = true;
          this.correct = !_.isEmpty(fetchedInteractions.data);
          this.interaction = {
            id: fetchedInteractions.data.interactionid,
            interaction: fetchedInteractions.data.interaction,
            blockId: fetchedInteractions.data.blockid,
            blockHeight: fetchedInteractions.data.blockheight,
            contractId: fetchedInteractions.data.contractid,
            func: fetchedInteractions.data.function,
            confirmationStatus: fetchedInteractions.data.confirmationstatus,
            confirmingPeer: fetchedInteractions.data.confirmingpeer
              ? fetchedInteractions.data.confirmingpeer.split(",")
              : "-",
            confirmedAtHeight: fetchedInteractions.data.confirmedAtHeight,
            tags: fetchedInteractions.data.interaction.tags,
            timestamp: fetchedInteractions.data.interaction.block.timestamp,
            timestampFormatted: dayjs.unix(
              fetchedInteractions.data.interaction.block.timestamp
            ),
            fee: fetchedInteractions.data.interaction.fee.winston,
            feeInAr: (
              fetchedInteractions.data.interaction.fee.winston *
              this.winstonToAR
            ).toFixed(8),
            recipient:
              fetchedInteractions.data.interaction.recipient == ""
                ? "-"
                : fetchedInteractions.data.interaction.recipient,
          };
          this.loaded = true;
        });
    },
    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ", " : "");
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
</style>
