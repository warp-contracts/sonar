<template>
  <div class="authorized-view">
    <div class="header">
      <div class="header-id">
        <p><img src="../../assets/icons/wallet-svgrepo-com.svg" alt="wallet icon" />{{ account | tx }}</p>
        <div class="flaticon-copy-to-clipboard" v-clipboard="account" title="Copy to clipboard"></div>
      </div>
      <button @click="refreshWallet" class="refresh-btn">
        <img src="../../assets/icons/refresh.svg" alt="refresh button" /> Refresh
      </button>
    </div>
    <div class="table-container">
      <b-table
        v-if="tokens?.length > 0"
        ref="table"
        id="tokens-table"
        :per-page="perPage"
        stacked="md"
        hover
        :small="true"
        :items="tokens"
        :fields="fields"
        :current-page="currentPage"
        :busy="isTableBusy"
      >
        <template #table-busy>
          <div class="d-flex flex-column justify-content-center align-items-center">
            <LoadingSpinner></LoadingSpinner>
            <strong>Loading tokens...</strong>
          </div>
        </template>
        <template #cell(id)="data">
          <div>
            <router-link
              style="min-width: 126px"
              :to="{
                path: '/app/contract/' + data.item.contract_tx_id,
                query: isTestnet ? { network: 'testnet' } : '',
              }"
            >
              {{ data.item.contract_tx_id | tx }}
            </router-link>
          </div></template
        >
        <template #cell(name)="data">{{ data.item.token_name }}</template>

        <!-- <template slot="row-details" slot-scope="data">
          <div class="json-display">
            <json-viewer :value="data.item" :expand-depth="1" copyable sort theme="json-theme">
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
        </template> -->
      </b-table>
      <div v-else class="no-tokens-info"><p>You have no tokens!</p></div>
    </div>
    <b-pagination
      v-if="tokens?.length > 0"
      v-model="currentPage"
      :total-rows="rows"
      :per-page="perPage"
      aria-controls="tokens-table"
      align="center"
      last-number
      first-number
    ></b-pagination>
    <div class="footer">
      <b-button @click="disconnectWallet" class="btn btn-modal rounded-pill"
        ><div></div>
        Switch wallet</b-button
      >
      <button @click="disconnectWallet" class="disconnect-btn">Disconnect</button>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '../../components/LoadingSpinner.vue';
export default {
  name: 'WalletConnected',
  components: {
    LoadingSpinner,
  },
  props: ['account', 'tokens'],
  data() {
    return {
      currentPage: 1,
      perPage: 7,
      fields: ['id', 'name', 'balance'],
    };
  },

  computed: {
    rows() {
      return this.tokens.length;
    },
    isTableBusy() {
      return this.$store.state.tableLoading;
    },
  },
  methods: {
    disconnectWallet() {
      this.$store.commit('deleteAccount');
    },
    refreshWallet() {
      this.$store.dispatch('getTokenBalance');
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../styles/mixins';
$warp-blue-filter: invert(45%) sepia(80%) saturate(2104%) hue-rotate(207deg) brightness(99%) contrast(91%);

.authorized-view {
  width: 90%;
  @include flex-center;
  flex-direction: column;

  .header {
    width: 100%;
    position: relative;

    @include flex-center;
    justify-content: space-between;
    margin-bottom: 2rem;
    .header-id {
      display: flex;
      p {
        font-weight: bold;
        @include flex-center;
        margin-bottom: 0;
        img {
          width: 2.2rem;
          margin-right: 0.5rem;
        }
      }
    }

    .refresh-btn {
      // position: absolute;
      // right: 0;
      // top: -1rem;

      border: none;
      background: none;

      &:hover {
        opacity: 0.85;
      }
      img {
        width: 2.2rem;
        height: 2.2rem;
        filter: $warp-blue-filter;
      }
    }
    .flaticon-copy-to-clipboard {
      margin-bottom: 0.6rem;
      filter: invert(36%) sepia(2%) saturate(0%) hue-rotate(43deg) brightness(97%) contrast(86%);

      &:active {
        opacity: 0.85;
      }
    }
    .left-side {
      @include flex-center;
    }
    .right-side {
      @include flex-center;

      button {
        background: none;
        border: none;
        img {
          width: 2.5rem;
          filter: $warp-blue-filter;
        }
        &:hover {
          opacity: 0.85;
        }
      }
    }
  }

  .table-container {
    min-height: 260px;
    width: 100%;
    #tokens-table {
      width: 100%;
      margin: 0 auto;
      margin-top: 1rem;
    }

    ::v-deep #tokens-table tbody tr {
      cursor: pointer;
    }

    ::v-deep #tokens-table tbody tr td {
      padding: 0.4rem;
      padding-left: 0;
      text-align: left;
      max-height: 25px;
      font-size: 1rem;
    }

    ::v-deep #tokens-table tbody tr {
      max-height: 25px;
    }

    ::v-deep #tokens-table thead tr th {
      padding: 0;
      padding-bottom: 0.5rem;
      text-align: left;
      font-size: 1.1rem;
    }
  }

  ul.pagination {
    padding-top: 0;
    margin-top: 1rem;
  }

  .footer {
    width: 100%;

    display: flex;
    justify-content: space-between;

    margin-top: 1rem;

    p {
      color: var(--warp-blue-color);
      font-size: 1.2rem;
      cursor: pointer;
      margin: 0;

      &:hover {
        opacity: 0.7;
      }
    }
    .disconnect-btn {
      border: none;
      background: none;
      color: var(--warp-blue-color);

      &:hover {
        opacity: 0.85;
      }
    }
  }
  .no-tokens-info {
    height: 220px;
    @include flex-center;
  }
}
</style>
