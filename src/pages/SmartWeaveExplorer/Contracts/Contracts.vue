<template>
  <div>
    <div class="contracts-wrapper d-lg-flex" style="marginBottom: 30px;">
      <div class="d-none d-md-block pl-5 pl-xl-0 chart">
        <div v-if="!loading" class="chart-title">Interactions</div>
        <v-chart
          class="chart"
          :option="option"
          :loading="loading"
          resize="width: 80%, height: 500px"
        />
      </div>
      <div class="stats-wrapper">
        <div class="item-text">
          <div>Total contracts</div>
          <div class="d-flex justify-content-center">
            <div v-if="totalContractsLoaded">
              <div>{{ totalContracts }}</div>
            </div>
            <div v-else class="align-self-center mt-4">
              <div class="dot-flashing"></div>
            </div>
            <div
              v-if="totalContractsLoaded"
              v-b-tooltip.hover
              title="Total number of contracts with at least one interaction."
              class="flaticon-question-tooltip"
            />
          </div>
        </div>
        <hr style="width: 50%" />
        <div class="item-text">
          <div>Total interactions</div>
          <div class="d-flex justify-content-center">
            <div v-if="totalInteractionsLoaded">
              <div>{{ totalInteractions }}</div>
            </div>
            <div v-else class="align-self-center mt-4">
              <div class="dot-flashing"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="contracts-wrapper">
      <div class="d-block d-sm-flex justify-content-between">
        <b-col lg="9" class="my-1 d-sm-flex py-3 px-0">
          <p class="filter-header mr-4 ml-2">Contract Type</p>
          <b-form-radio-group
            id="contract-type-group"
            name="contract-type-group"
            @change="refreshData"
            v-model="selected"
            class="contract-type-group"
          >
            <div class="contract-type-item">
              <b-form-radio value="all">All</b-form-radio>
            </div>
            <div class="contract-type-item">
              <b-form-radio value="pst">PST</b-form-radio>
            </div>
            <div class="contract-type-item">
              <b-form-radio value="other">Other</b-form-radio>
            </div>
          </b-form-radio-group>
        </b-col>
      </div>
      <TxList :paging="pages" @page-clicked="onPageClicked">
        <b-table
          ref="table"
          id="contracts-table"
          stacked="md"
          hover
          :items="contracts"
          :fields="fields"
          @row-clicked="rowClicked"
          :busy="!contractsLoaded"
        >
          <template #table-busy> </template>

          <template #cell(token)="data">
            <div v-if="data.item.token">{{ data.item.token }}</div>
            <div v-else>-</div>
          </template>
          <template #cell(contractId)="data" class="text-right">
            <a
              @click="
                $router.push({
                  path: '/app/contract/' + data.item.contractId,
                })
              "
              target="_blank"
            >
              {{ data.item.contractId | tx }}
            </a>
          </template>

          <template #cell(owner)="data">
            <a
              :href="
                `https://viewblock.io/arweave/address/${data.item.blockId}`
              "
              target="_blank"
            >
              {{ data.item.owner | tx }}</a
            >
          </template>

          <template #cell(type)="data">
            <div class="text-uppercase">{{ data.item.type }}</div>
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
            class="preloader text-preloader tx-preloader"
          ></div>
        </div>
      </TxList>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import axios from "axios";
import TxList from "@/components/TxList/TxList";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";
import VChart, { LOADING_OPTIONS_KEY } from "vue-echarts";
import dayjs from "dayjs";
import constants from "@/constants";

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  DataZoomComponent,
]);
export default {
  name: "Contracts",
  provide: {
    [LOADING_OPTIONS_KEY]: {
      text: "",
      color: "#5982f1",
      textColor: "#000",
      maskColor: "rgba(255, 255, 255, 0)",
      showSpinner: true,
    },
  },
  data() {
    return {
      selected: "all",
      chartLoading: true,
      loading: true,
      option: {
        tooltip: {
          trigger: "axis",
          position: function(pt) {
            return [pt[0], "10%"];
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [],
        },
        yAxis: {
          type: "value",
          boundaryGap: [0, "100%"],
          min: 0,
          max: 2500,
        },
        dataZoom: [
          {
            type: "slider",
            start: "",
            end: "",
            dataBackground: {
              lineStyle: {
                color: "#5982f1",
              },
              areaStyle: {
                color: "#5982f1",
                shadowColor: "#5982f1",
                opacity: 0.2,
              },
            },
          },
          {
            start: "",
            end: "",
          },
        ],
        series: [
          {
            name: "Interactions",
            type: "line",
            data: [],
            lineStyle: { color: "#5982f1" },
          },
        ],
      },
      fields: [
        "token",
        "contractId",
        "owner",
        "type",
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
      loaded: false,
      limit: 15,
      totalContracts: 0,
      totalInteractions: 0,
      totalContractsLoaded: false,
      totalInteractionsLoaded: false,
    };
  },

  mounted() {
    this.currentPage = this.$route.query.page ? this.$route.query.page : 1;
    this.getContracts(
      this.$route.query.page ? this.$route.query.page : this.currentPage
    );
    this.getStatsPerDay();
    this.getStats();
  },
  components: { TxList, VChart },
  computed: {
    pages() {
      return this.paging ? this.paging : null;
    },
    contractsLoaded() {
      return (
        this.contracts &&
        this.paging &&
        this.contracts.length ==
          (this.paging.items > this.limit ? this.limit : this.paging.items)
      );
    },
  },

  methods: {
    getTokenUrl(token) {
      return `https://cdn.redstone.finance/symbols/${token}.png`;
    },
    refreshData() {
      if (this.currentPage > 1) {
        this.$router.push({ query: {} });
      }
      this.currentPage = 1;
      this.selected == "all"
        ? this.getContracts(this.currentPage)
        : this.getContracts(this.currentPage, this.selected);
    },
    async getStats() {
      axios.get(`${constants.gatewayUrl}/gateway/stats`).then((fetchedData) => {
        this.totalContracts = fetchedData.data.total_contracts;
        this.totalInteractions = fetchedData.data.total_interactions;
        this.totalContractsLoaded = true;
        this.totalInteractionsLoaded = true;
      });
    },
    async getStatsPerDay() {
      axios
        .get(`${constants.gatewayUrl}/gateway/stats/per-day`)
        .then((fetchedData) => {
          for (const options of fetchedData.data) {
            this.option.xAxis.data.push(
              dayjs(options.date).format("DD-MM-YYYY")
            );
            this.option.series[0].data.push(options.per_day);
          }
          const end = 100;
          const totalTime =
            new Date(
              fetchedData.data[fetchedData.data.length - 1].date
            ).getTime() - new Date(fetchedData.data[0].date).getTime();
          const start = 100 - (2592000000 / totalTime) * 100;
          this.option.dataZoom[0].start = start;
          this.option.dataZoom[0].end = end;
          this.option.dataZoom[1].start = start;
          this.option.dataZoom[1].end = end;
          this.loading = false;
        });
    },

    async onPageClicked(pageNumber) {
      this.currentPage = pageNumber;
      if (this.selected == "all") {
        this.getContracts(this.currentPage);
      } else {
        this.getContracts(this.currentPage, this.selected);
      }
    },
    async getContracts(page, type) {
      this.contracts = [];
      axios
        .get(
          `${constants.gatewayUrl}/gateway/contracts?limit=${
            this.limit
          }&page=${page}${type ? `&type=${type}` : ""}`
        )

        .then(async (fetchedContracts) => {
          this.paging = fetchedContracts.data.paging;
          for (const contract of fetchedContracts.data.contracts) {
            this.contracts.push({
              token: contract.token,
              id: contract.contract,
              contractId: contract.contract,
              owner: contract.owner,
              total: contract.interactions,
              confirmed: contract.confirmed,
              corrupted: contract.corrupted,
              lastInteractionHeight: contract.last_interaction_height,
              type: contract.type,
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
.chart-wrapper {
  width: 80%;
  height: 300px;
}
.chart {
  height: 300px;
  width: 80%;
  margin-top: -15px;
  margin-left: -12px;
  position: relative;

  @media (min-width: breakpoint-max(lg)) {
    width: 80%;
  }
}

.chart-title {
  transform: rotate(270deg);
  position: absolute;
  left: -20px;
  bottom: 150px;
}

#contract-type-group {
  .custom-control-input:checked ~ .custom-control-label:before {
    background-color: var(--redstone-smartweave-blue-color) !important;
    border-color: var(--redstone-smartweave-blue-color) !important;
    border-radius: 50%;
  }
}
</style>
