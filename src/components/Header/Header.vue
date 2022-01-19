<template>
  <b-navbar class="header d-print-none app-header">
    <b-nav>
      <div class="logo-container align-self-center">
        <a href="/">
          <div class="logo-image-container">
            <img
              class="d-none d-md-block logo-image first"
              src="/smartweave-logo.svg"
            />
            <img
              class="d-block d-md-none logo-image first"
              src="/smartweave-favicon.png"
            />
          </div>
        </a>
      </div>
    </b-nav>
    <b-nav class="w-25 w-md-auto">
      <b-form class="ml-1" inline>
        <b-form-group style="margin-bottom: 0">
          <b-input-group
            v-if="showSearchInputInHeader"
            class="input-group-no-border"
          >
            <template v-slot:prepend>
              <b-input-group-text v-if="!searching"
                ><i class="fi flaticon-search-2"
              /></b-input-group-text>
              <b-input-group-text v-if="searching" class="blue"
                ><b-spinner
                  style="width: 20px; height: 20px;"
                  label="Busy"
                ></b-spinner>
              </b-input-group-text>
            </template>

            <vue-typeahead-bootstrap
              v-model="query"
              :ieCloseFix="false"
              :data="foundContracts"
              :serializer="
                (item) =>
                  item.type == 'pst'
                    ? item.pst_ticker.substring(0, 3).toLowerCase() ==
                      query.substring(0, 3).toLowerCase()
                      ? item.pst_ticker
                      : item.pst_name
                    : item.contract_id
              "
              @hit="goToContract"
              @input="lookupContracts"
              :placeholder="test"
              :maxMatches="1000"
              class="input-search"
            >
              <template slot="suggestion" slot-scope="{ data, htmlText }">
                <div class="d-block d-md-flex justify-content-between">
                  <span
                    v-if="data.type == 'pst'"
                    class="d-none d-md-block text-left"
                    >{{ data.contract_id }}</span
                  >
                  <span class="suggestion-type d-block d-md-none">{{
                    data.type
                  }}</span>
                  <span
                    v-if="data.type == 'pst'"
                    class="text-nowrap pst-match"
                    v-html="htmlText"
                  ></span>
                  <span v-else class="text-nowrap" v-html="htmlText"></span>
                  <span
                    v-if="data.type == 'pst'"
                    class="d-block d-md-none text-nowrap text-left"
                    >{{ data.contract_id }}</span
                  >
                  <div style="width: 12%">
                    <span class="d-none d-md-block suggestion-type mt-1">{{
                      data.type
                    }}</span>
                  </div>
                </div>
              </template>
            </vue-typeahead-bootstrap>
          </b-input-group>
          <a href="javascript:window.history.back()" v-else>
            <i class="fa flaticon-chevron-back" />
          </a>
        </b-form-group>
      </b-form>
    </b-nav>
    <b-nav></b-nav>
    <b-nav class="align-items-center flex-grow-1 justify-content-end">
      <b-button class="btn btn-modal rounded-pill" v-b-modal.modal-1>{{
        findMoreText
      }}</b-button>
      <b-modal id="modal-1" title="Redstone SmartWeave Gateway" size="lg">
        <Modal />
        <template #modal-footer><div></div></template>
      </b-modal>
    </b-nav>
  </b-navbar>
</template>

<script>
import VueTypeaheadBootstrap from "vue-typeahead-bootstrap";
import _ from "lodash";
import { mapState, mapActions } from "vuex";
import { debounce } from "lodash/function";
import Modal from "@/components/Modal/Modal";
import constants from "@/constants";

export default {
  name: "Header",
  components: {
    VueTypeaheadBootstrap,
    Modal,
  },
  data() {
    return {
      query: "",
      search: this.$route.query.search,
      selectedContract: null,
      foundContracts: [],
      searching: false,
    };
  },
  computed: {
    ...mapState("layout", ["showSearchInputInHeader"]),
    test() {
      return screen.width >= 768
        ? "Search PST, Contracts, Interactions..."
        : "Search...";
    },
    findMoreText() {
      return screen.width >= 768 ? "Find out more" : "More";
    },

    searchTerm: {
      get() {
        return this.$store.state.layout.searchTerm;
      },
      set(value) {
        this.updateSearchTerm(value);

        if (value) {
          this.$router.push({
            query: {
              ...this.$route.query,
              search: value,
            },
          });
        } else {
          const queryWithoutSearchInput = _.omit(this.$route.query, ["search"]);
          this.$router.push({ query: queryWithoutSearchInput });
        }
      },
    },
  },

  created() {
    this.updateSearchTerm(this.$route.query.search);
  },

  methods: {
    ...mapActions("layout", ["updateSearchTerm"]),
    goToContract(data) {
      if (data.type == "contract" || data.type == "pst") {
        this.$router.push(`/app/contract/${data.contract_id}`);
      } else {
        this.$router.push(`/app/interaction/${data.contract_id}`);
      }
      this.foundContracts = [];
      this.query = "";
    },
    lookupContracts: debounce(function() {
      this.searching = true;
      if (this.query?.length < 3) {
        this.searching = false;
        this.foundContracts = [];
        return;
      }
      fetch(`${constants.gatewayUrl}/gateway/search/${this.query}`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.foundContracts = data;
          this.searching = false;
        });
    }, 500),
  },
};
</script>

<style src="./Header.scss" lang="scss"></style>
