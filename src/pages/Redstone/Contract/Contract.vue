<template>
  <div class="providers-wrapper">
    <div class="d-flex pl-3">
      <div class="flaticon-file-signature m-0-auto"></div>
      <div class="align-self-end contract-header">Contract</div>
      <div class="align-self-end contract-id">{{ contractId }}</div>
      <div
        class="flaticon-copy-to-clipboard"
        v-clipboard="contractId"
        title="Copy to clipboard"
      ></div>
    </div>
    <div class="contract-details-wrapper">
      <div class="cell">
        <div class="cell-header">Owner</div>
        <div class="d-flex">
          <div>{{ owner }}</div>
          <div
            class="flaticon-copy-to-clipboard"
            v-clipboard="contractId"
            title="Copy to clipboard"
          ></div>
        </div>
      </div>
      <div class="cell">
        <div class="cell-header">Total interactions</div>
        <div>{{ total }}</div>
      </div>
      <div class="cell">
        <div class="cell-header">Confirmed interactions</div>
        <div>{{ confirmed }}</div>
      </div>
      <div class="cell">
        <div class="cell-header">Corrupted interactions</div>
        <div>{{ corrupted }}</div>
      </div>
    </div>
    <div class="provider-tabs">
      <b-tabs @input="onInput">
        <b-tab title="Transactions">
          <b-col lg="6" class="my-1 d-flex py-3 px-0">
            <p class="font-weight-bold mr-4 ml-2">Confirmation Status</p>
            <b-form-radio-group
              :options="options"
              id="confirmation-status-group"
              @change="changeMethod"
              v-model="selected"
            >
            </b-form-radio-group>
          </b-col>
          <div v-if="visitedTabs.includes(0)">
            <TxList :paging="pages" @page-clicked="onPageClicked">
              <b-table
                ref="table"
                id="interactions-table"
                stacked="md"
                hover
                :sort-by="'id'"
                :items="interactions"
                :fields="fields"
                @row-clicked="rowClicked"
                :busy="!interactionsLoaded"
              >
                <template #table-busy> </template>

                <template #cell(id)="data">
                  <a
                    :href="
                      `https://viewblock.io/arweave/tx/${data.item.interactionId}`
                    "
                    target="_blank"
                  >
                    {{ data.item.interactionId | tx }}</a
                  >
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
                  <a
                    :href="
                      `http://${data.item.confirmingPeers[0]}:1984/tx/${data.item.interactionId}/status`
                    "
                    target="_blank"
                    class="mr-1"
                  >
                    {{ data.item.confirmingPeers[0] }}</a
                  >

                  <a
                    :href="
                      `http://${data.item.confirmingPeers[1]}:1984/tx/${data.item.interactionId}/status`
                    "
                    target="_blank"
                    class="mr-1"
                  >
                    {{ data.item.confirmingPeers[1] }}</a
                  >

                  <a
                    :href="
                      `http://${data.item.confirmingPeers[2]}:1984/tx/${data.item.interactionId}/status`
                    "
                    target="_blank"
                    class="mr-1"
                  >
                    {{ data.item.confirmingPeers[2] }}</a
                  >
                </template>

                <template #cell(actions)="data">
                  <i
                    v-if="!data.item._showDetails"
                    class="fa fa-chevron-down"
                  />
                  <i v-else class="fa fa-chevron-up" />
                </template>

                <template slot="row-details" slot-scope="data">
                  <div>
                    <json-viewer
                      :value="data.item.tags"
                      :expand-depth="1"
                      copyable
                      sort
                    ></json-viewer>
                    <json-viewer
                      :value="data.item.interaction"
                      :expand-depth="1"
                      copyable
                      sort
                    ></json-viewer>
                  </div>
                </template>
              </b-table>
              <div v-if="!interactionsLoaded">
                <div
                  v-for="n in 15"
                  :key="n"
                  class="preloader text-preloader manifest-preloader"
                ></div>
              </div>
            </TxList>
          </div>
        </b-tab>
        <b-tab title="Code">
          <div v-if="visitedTabs.includes(1)">
            <CodeSandbox :contractId="contractId"></CodeSandbox>
          </div>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import axios from "axios";
import TxList from "@/components/TxList/TxList";
import { TagsParser } from "redstone-smartweave";
import JsonViewer from "vue-json-viewer";
import Arweave from "arweave";
import CodeSandbox from "./CodeSandbox/CodeSandbox";
import { mapState } from "vuex";
import moment from "moment";

export default {
  name: "Contract",

  data() {
    return {
      visitedTabs: [],
      info: null,
      fields: [
        "id",
        "block_id",
        "block_height",
        "age",
        "owner",
        "function",
        "status",
        "confirmingPeers",
        { key: "actions", label: "" },
      ],
      interactions: null,
      currentPage: 1,
      paging: null,
      owner: "",
      total: 0,
      limit: 15,
      selected: "all",
      options: [
        { text: "All", value: "all" },
        { text: "Confirmed", value: "confirmed" },
        { text: "Corrupted", value: "corrupted" },
        { text: "Not corrupted", value: "not_corrupted" },
      ],
    };
  },

  mounted() {
    this.getInteractions(
      this.$route.query.page ? this.$route.query.page : this.currentPage
    );
  },

  components: { CodeSandbox, TxList, JsonViewer },
  computed: {
    contractId() {
      return this.$route.params.id;
    },
    confirmed() {
      return this.$route.query.confirmed;
    },
    corrupted() {
      return this.$route.query.corrupted;
    },
    ...mapState("prefetch", {
      smartweave: function(state) {
        const { definitionLoader } = state.smartweave;
        const tx = definitionLoader
          .load(this.contractId)
          .then((defContract) => {
            return defContract;
          })
          .then((d) => {
            this.owner = d.owner;
            return d;
          });
        return tx;
      },
      arweave: (state) => {
        return state.arweave;
      },
    }),
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
    changeMethod() {
      if (this.selected == "all") {
        this.getInteractions(this.currentPage);
      } else {
        this.getInteractions(this.currentPage, this.selected);
      }
    },
    onInput(value) {
      if (!this.visitedTabs.includes(value)) {
        this.visitedTabs.push(value);
      }
    },
    rowClicked(record) {
      this.$set(record, "_showDetails", !record._showDetails);
    },
    toHumanDate(timestamp) {
      const date = new Date(timestamp * 1000);
      const datevalues = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
      ];
      return datevalues;
    },
    async onPageClicked(pageNumber) {
      this.currentPage = pageNumber;
      this.getInteractions(this.currentPage);
    },
    async getInteractions(page, confirmationStatus) {
      this.interactions = [];
      axios
        .get(
          `https://gateway.redstone.finance/gateway/interactions?contractId=${
            this.contractId
          }&limit=${this.limit}&page=${page}${
            confirmationStatus
              ? `&confirmationStatus=${confirmationStatus}`
              : ""
          }`
        )

        .then(async (fetchedInteractions) => {
          const smartweave = this.smartweave;
          this.paging = fetchedInteractions.data.paging;
          this.total = fetchedInteractions.data.paging.total;
          const tagsParser = new TagsParser();
          for (const i of fetchedInteractions.data.interactions) {
            const obj = {
              cursor: "",
              node: i.interaction,
            };
            let inputFunc = JSON.parse(
              tagsParser.getInputTag(obj, this.contractId).value
            ).function;
            this.interactions.push({
              id: i.interaction.id,
              interactionId: i.interaction.id,
              blockId: i.interaction.block.id,
              blockHeight: i.interaction.block.height,
              age: moment(moment.unix(i.interaction.block.timestamp)).fromNow(),
              function: inputFunc ? inputFunc : "-",
              status: i.status,
              owner: i.interaction.owner.address,
              confirmingPeers: i.confirming_peers
                ? i.confirming_peers.split(",")
                : "-",
              interaction: i.interaction,
              tags: tagsParser.getInputTag(obj, this.contractId),
            });
          }
        });
    },
    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ", " : "");
    },
  },
};
</script>

<style src="./Contract.scss" lang="scss" scoped></style>
<style lang="scss">
.provider-tabs > .tabs > div:first-of-type {
  height: 44px;
}

.provider-tabs {
  .nav-tabs > .nav-item {
    flex: 0 0 124px;
  }
}

.jv-container {
  .jv-code {
    > .jv-node {
      max-width: 90%;
    }
  }
}

#confirmation-status-group {
  .custom-control-input:checked ~ .custom-control-label:after {
    background-color: var(--redstone-smartweave-blue-color) !important;
    border-color: var(--redstone-smartweave-blue-color) !important;
    border-radius: 50%;
  }
}
</style>
