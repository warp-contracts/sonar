<template>
  <div class="providers-wrapper">
    <TxList :paging="pages" @page-clicked="onPageClicked">
      <b-table
        ref="table"
        id="assets-table"
        stacked="md"
        hover
        :items="contracts"
        :fields="fields"
        @row-clicked="rowClicked"
        :busy="!contractsLoaded"
      >
        <template #table-busy> </template>
        <template #cell(contractId)="data" class="text-right">
          <a
            @click="
              $router.push({
                path: '/app/contract/' + data.item.contractId,
                query: {
                  confirmed: data.item.confirmed,
                  corrupted: data.item.corrupted,
                },
              })
            "
            target="_blank"
          >
            {{ data.item.contractId | tx }}
          </a>
        </template>

        <template #cell(owner)="data">
          <a
            :href="`https://viewblock.io/arweave/address/${data.item.blockId}`"
            target="_blank"
          >
            {{ data.item.owner | tx }}</a
          >
        </template>

        <template #cell(total)="data">
          <div class="text-right">{{ data.item.total }}</div>
        </template>

        <template #cell(confirmed)="data">
          <div class="text-right">{{ data.item.confirmed }}</div>
        </template>

        <template #cell(corrupted)="data">
          <div class="text-right">{{ data.item.corrupted }}</div>
        </template>

        <template #cell(lastInteractionHeight)="data">
          <div class="text-right">
            {{ data.item.lastInteractionHeight }}
          </div>
        </template>
      </b-table>

      <div v-if="!contractsLoaded">
        <div
          v-for="n in 15"
          :key="n"
          class="preloader text-preloader manifest-preloader"
        ></div>
      </div>
    </TxList>
  </div>
</template>

<script>
import _ from "lodash";
import axios from "axios";
import TxList from "@/components/TxList/TxList";
import { mapState } from "vuex";

export default {
  name: "Contracts",

  data() {
    return {
      fields: [
        "contractId",
        "owner",
        {
          key: "total",
          label: "total",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "confirmed",
          label: "confirmed",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "corrupted",
          label: "corrupted",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "lastInteractionHeight",
          label: "last interaction height",
          thClass: "text-right",
          tdClass: "text-right",
        },
      ],
      contracts: [],
      currentPage: 1,
      paging: null,
      contractTx: null,
      loaded: false,
      limit: 15,
    };
  },

  mounted() {
    this.getContracts(
      this.$route.query.page ? this.$route.query.page : this.currentPage
    );
  },

  created() {},

  components: { TxList },
  computed: {
    ...mapState("prefetch", {
      smartweave: (state) => {
        return state.smartweave;
      },
      arweave: (state) => {
        return state.arweave;
      },
    }),
    pages() {
      return this.paging ? this.paging : null;
    },
    contractsLoaded() {
      console.log(this.contracts.length);
      console.log(this.paging);
      console.log(this.contracts.length == this.limit);
      return (
        this.contracts &&
        this.paging &&
        this.contracts.length ==
          (this.paging.items > this.limit ? this.limit : this.paging.items)
      );
    },
  },

  methods: {
    async onPageClicked(pageNumber) {
      this.contracts = [];
      this.getContracts(pageNumber);
    },
    async getContracts(page) {
      axios
        .get(
          `https://gateway.redstone.finance/gateway/contracts?limit=${this.limit}&page=${page}`
        )

        .then(async (fetchedContracts) => {
          this.paging = fetchedContracts.data.paging;
          for (const contract of fetchedContracts.data.contracts) {
            const { definitionLoader } = this.smartweave;
            await definitionLoader
              .load(contract.contract)
              .then((contractDefinition) => {
                this.contractTx = contractDefinition;
                const owner = contractDefinition.owner;
                this.contracts.push({
                  id: contract.contract,
                  contractId: contract.contract,
                  owner: owner,
                  total: contract.interactions,
                  confirmed: contract.confirmed,
                  corrupted: contract.corrupted,
                  lastInteractionHeight: contract.last_interaction_height,
                });
              });
          }
        });
    },
    rowClicked(record) {
      this.$set(record, "_showDetails", !record._showDetails);
    },
    styleCategory(text, numberOfCategories, index) {
      return _.startCase(text) + (index < numberOfCategories - 1 ? ", " : "");
    },
  },
};
</script>

<style src="./Contracts.scss" lang="scss" scoped></style>
<style lang="scss">
.providers-wrapper #assets-table {
  table-layout: fixed;

  th:nth-of-type(1) {
    width: 18%;
  }

  th:nth-of-type(1) {
    width: 18%;
  }
  th:not(:nth-of-type(1)):not(:nth-of-type(2)) {
    width: 16%;
  }

  td .source-links {
    overflow: hidden;
  }
}
</style>
