<template>
  <div class="acc-nav-container" :class="[loading ? 'justify-content-center' : '', account ? 'acc-nav-big' : '']">
    <div class="unauthorized-view" v-if="!account">
      <div class="buttons-container" v-if="!loading">
        <p class="nav-header">Choose wallet</p>
        <b-button @click="handleMetamask" class="btn btn-modal rounded-pill"
          ><div><img src="../../assets/icons/MetaMask_Fox.svg" alt="metamask logo icon" /></div>
          Metamask</b-button
        >
        <b-button class="btn btn-modal rounded-pill"
          ><div><img src="../../assets/icons/arweave-ar-logo.svg" alt="arweave logo icon" /></div>
          Arweave.app</b-button
        >
        <p class="nav-subtext">Connect wallet to display your token balance</p>
      </div>
      <LoadingSpinner v-else></LoadingSpinner>
    </div>
    <div class="authorized-view" v-else>
      <div class="header">
        <div class="left-side">
          <p><img src="../../assets/icons/wallet-svgrepo-com.svg" alt="" />{{ account | tx }}</p>
        </div>
        <div class="right-side"><button>Switch</button></div>
      </div>
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
        @row-clicked="rowClicked"
      >
        <template #table-busy>
          <div class="d-flex flex-column justify-content-center align-items-center">
            <LoadingSpinner></LoadingSpinner>
            <strong>Loading tokens...</strong>
          </div>
        </template>
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
      <!-- <div v-else><p>You have no tokens!</p></div> -->
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
      <div class="footer"><p>Hide</p></div>
    </div>
  </div>
</template>

<script>
import MetaMaskOnboarding from '@metamask/onboarding';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
export default {
  name: 'AccountNavigation',
  components: {
    LoadingSpinner,
  },
  props: {},
  data() {
    return {
      account: null,
      loading: false,
      tokens: null,
      currentPage: 1,
      perPage: 4,
      fields: ['name', 'balance'],
      isTableBusy: false,
    };
  },
  // mounted() {
  //   this.checkMetamask();
  // },
  computed: {
    rows() {
      return this.tokens.length;
    },
  },
  methods: {
    async handleMetamask() {
      if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
        let failToast = this.$toasted.show('Metamask not detected!', {
          theme: 'outline',
          position: 'top-left',
          duration: 3000,
        });
        return;
      }
      this.loading = true;
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.account = accounts[0];
      // let successToast = this.$toasted.show('Authenticated!', {
      //   theme: 'outline',
      //   position: 'top-left',
      //   duration: 3000,
      // });
      if (this.account) {
        this.isTableBusy = true;
        await this.getTokenBalances();
        // this.isTableBusy = false;
      }
      this.loading = false;
    },
    // checkMetamask() {
    //   if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
    //     this.isMetamask = false;
    //   } else {
    //     this.isMetamask = true;
    //   }
    // },

    async getTokenBalances() {
      // const response = await fetch(
      //   `https://contracts.warp.cc/balances?walletAddress=${this.account}&page=${this.currentPage}`
      // );

      const response = await fetch(
        `https://contracts.warp.cc/balances?walletAddress=FAxDUPlFfJrLDl6BvUlPw3EJOEEeg6WQbhiWidU7ueY`
      );

      const data = await response.json();
      this.tokens = data.balances;
    },
  },
};
</script>

<style lang="scss" scoped>
$scaleXValue: 1.4;
$scaleYValue: 2.2;
$warp-blue: #5982f1;
.acc-nav-container {
  height: 28rem;
  width: 36rem;
  padding: 1rem;

  position: fixed;
  z-index: 999;
  top: 60px;
  right: 54px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  // glass effect
  background: rgba(255, 255, 255, 0.63);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5.6px);
  -webkit-backdrop-filter: blur(5.6px);
  border: 1px solid rgba(89, 130, 241, 0.05);

  transition: scale 0.8s ease;
  transform-origin: right top;

  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
  .unauthorized-view {
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;

    .buttons-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 80%;
      p.nav-header {
        // color: white;
        font-size: 1.2rem;
        margin: 0 auto;
      }

      button {
        display: flex;
        justify-content: center;
        align-items: center;
        div {
          width: 32px;
          height: 32px;
          margin-right: 0.6rem;

          img {
            object-fit: cover;
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }

  .authorized-view {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .header {
      display: flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      gap: 2rem;

      .left-side {
        // width: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        p {
          font-weight: bold;
          display: flex;
          align-items: center;
          margin-bottom: 0;
          img {
            width: 2rem;
            margin-right: 0.5rem;
          }
        }
      }
      .right-side {
        // width: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    #tokens-table {
      min-height: 150px;
      width: 80%;
      margin: 0 auto;
      margin-top: 1rem;
    }

    ::v-deep #tokens-table tbody tr {
      cursor: pointer;
    }

    ::v-deep #tokens-table tbody tr td {
      padding: 0.2rem;
      text-align: center;
    }

    ::v-deep #tokens-table thead tr th {
      padding: 0;
      text-align: center;
    }

    ul.pagination {
      padding-top: 0;
      margin-top: 1rem;
    }

    .footer {
      margin-top: 1rem;

      p {
        color: $warp-blue;
        font-size: 1.2rem;
        cursor: pointer;
        margin: 0;

        &:hover {
          opacity: 0.7;
        }
      }
    }
  }
}
</style>
