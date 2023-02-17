<template>
  <div class="code-container">
    <div class="source-code-wrapper">
      <div
        v-if="!loaded"
        class="state-container"
        :class="loaded ? '' : ['d-flex', 'align-items-center', 'flex-column', 'pt-5']"
      >
        <LoadingSpinner></LoadingSpinner>
        <p>Loading contract code...</p>
      </div>
      <div v-if="loaded && !correct" class="state-container">Could not retrieve Contract Code.</div>
      <pre
        v-if="loaded && contractSrc && !wasm && renderComponent"
      ><code class="language-javascript">{{ contractSrc }}</code></pre>
      <div v-if="loaded && contractSrc && wasm">
        <ul id="code-wasm">
          <li v-for="(item, idx) in contractSrc" :key="idx">
            <pre class="py-4"><code>{{ idx.substring(idx.split('/', 4).join('/').length + 1) }}</code></pre>

            <pre><code class="language-javascript">{{contractSrc[idx]}}</code></pre>
          </li>
        </ul>
      </div>
    </div>
    <div class="version-nav">
      <nav>
        <p>Browse versions</p>
        <ul>
          <li
            :class="{ 'active-item': activeItem == 'current' }"
            @click="changeCodeSource(currentSrcVersion, 'current')"
          >
            <img
              v-if="activeItem == 'current'"
              src="../../../../assets/icons/tick-circle.svg"
              alt="active item circle tick icon"
              class="chosen-icon"
            />

            Current
          </li>
          <li
            v-for="(version, key) in contractSrcHistory"
            :key="key"
            @click="changeCodeSource(version, key)"
            :class="{ 'active-item': activeItem == key }"
          >
            <img
              v-if="activeItem == key"
              src="../../../../assets/icons/tick-circle.svg"
              alt="active item circle tick icon"
              class="chosen-icon"
            />
            <div class="d-flex flex-column">
              <p class="text-nowrap mb-0">Timestamp</p>
              <a :href="`/#/app/source/${version.srcTxId}${isTestnet ? '?network=testnet' : ''}`">{{
                version.srcTxId | tx
              }}</a>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import { WasmSrc } from 'warp-contracts';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

export default {
  name: 'ContractCode',
  components: {
    LoadingSpinner,
  },
  props: {
    contractId: String,
    sourceId: String,
    wasm: Boolean,
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'isTestnet', 'arweave']),
  },
  data() {
    return {
      loaded: false,
      correct: true,
      code: null,
      contractSrc: null,
      renderComponent: true,
      activeItem: 'current',
      contractSrcHistory: null,
      currentSrcVersion: null,
    };
  },
  updated: function () {
    Prism.highlightAll();
  },
  async mounted() {
    if (this.wasm) {
      axios.get(`https://gateway.warp.cc/gateway/v2/contract?txId=${this.contractId}`).then(async (fetchedSource) => {
        if (fetchedSource.status !== 200) {
          this.loaded = true;
          this.correct = false;
          return;
        }
        if (fetchedSource.data.evolvedSrc.length > 0) {
          this.contractSrcHistory = fetchedSource.data.evolvedSrc;
        }
        await this.parseCode(fetchedSource.data, true);
      });
    } else {
      axios.get(`https://gateway.warp.cc/gateway/v2/contract?txId=${this.contractId}`).then((fetchedSource) => {
        if (fetchedSource.status !== 200) {
          this.loaded = true;
          this.correct = false;
          return;
        }
        this.contractSrc = fetchedSource.data.src;
        this.currentSrcVersion = fetchedSource.data;
        if (fetchedSource.data.evolvedSrc.length > 0) {
          this.contractSrcHistory = fetchedSource.data.evolvedSrc;
        }
        this.loaded = true;
        console.log(this.contractSrcHistory);
      });
    }
  },
  methods: {
    getAs(obj) {
      const contractKey = this.getObjKey('contract.ts', obj);
      const contract = obj[contractKey];
      const schemasKey = this.getObjKey('schemas.ts', obj);
      const schemas = obj[schemasKey];
      const actionsKey = this.getObjKey('actions/', obj);
      const actions = obj[actionsKey];
      let objOrder = {
        [contractKey]: contract,
        [schemasKey]: schemas,
        [actionsKey]: actions,
      };
      return Object.assign(objOrder, obj);
    },
    getRust(obj) {
      const contractKey = this.getObjKey('contract.rs', obj);
      const contract = obj[contractKey];
      const actionKey = this.getObjKey('action.rs', obj);
      const action = obj[actionKey];
      const stateKey = this.getObjKey('state.rs', obj);
      const state = obj[stateKey];
      const errorKey = this.getObjKey('error.rs', obj);
      const error = obj[errorKey];
      const actionsKey = this.getObjKey('actions/', obj);
      const actions = obj[actionsKey];
      let objOrder = {
        [contractKey]: contract,
        [actionKey]: action,
        [stateKey]: state,
        [errorKey]: error,
        [actionsKey]: actions,
      };
      return Object.assign(objOrder, obj);
    },
    getGo(obj) {
      const mainKey = this.getObjKey('main.go', obj);
      const main = obj[mainKey];
      const contractKey = this.getObjKey('contract.go', obj);
      const contract = obj[contractKey];
      const actionsKey = this.getObjKey('actions.go', obj);
      const actions = obj[actionsKey];
      const typesKey = this.getObjKey('types.go', obj);
      const types = obj[typesKey];
      let objOrder = {
        [mainKey]: main,
        [contractKey]: contract,
        [actionsKey]: actions,
        [typesKey]: types,
      };
      return Object.assign(objOrder, obj);
    },
    getObjKey(objKey, obj) {
      return Object.keys(obj).find((key) => key.includes(objKey));
    },
    toArrayBuffer(buf) {
      const ab = new ArrayBuffer(buf.length);
      const view = new Uint8Array(ab);
      for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
      }
      return ab;
    },
    async handleCalls(frameEvent, event, contentWindow, origin) {
      if (frameEvent === 'arCodeLoaded') {
        this.loaded = true;
      } else if (frameEvent === 'arcodeAction') {
        const payload = event.data.payload;
        const method = payload.method;
        const reqId = event.data.id;
        const response = {
          function: '',
          payload: '',
          id: reqId,
        };

        if (method !== 'startHandshake' && !window.arweaveWallet) {
          response['function'] = 'error';
          response['payload'] = 'ArConnect/Finnie not detected!';
          contentWindow.postMessage(response, origin);
          return;
        }

        if (method === 'startHandshake') {
          response['function'] = 'handshake';
          response['payload'] = 'bridgeActive';
          contentWindow.postMessage(response, origin);
        } else if (method === 'sign') {
          let errorSigning = '';
          const tx = payload.data.transaction;
          const options = payload.data.options;
          response['function'] = 'signedTransaction';

          try {
            await window.arweaveWallet.connect(['SIGN_TRANSACTION']);
            const signedTransaction = await window.arweaveWallet.sign(tx, options);
            response['payload'] = signedTransaction;
          } catch (err) {
            console.log('Error, trying to sign tx ... ', err);
            errorSigning = err;
          }

          if (errorSigning) {
            response['function'] = 'error';
            response['payload'] = errorSigning;
          }
          contentWindow.postMessage(response, origin);
        } else if (method === 'getAddress') {
          let wallet = '';
          let errorGetAddress = '';
          response['function'] = 'address';
          try {
            await window.arweaveWallet.connect(['ACCESS_ADDRESS']);
            wallet = await window.arweaveWallet.getActiveAddress();
            response['payload'] = wallet;
          } catch (err) {
            console.log('Error, trying to connect... ', err);
            errorGetAddress = err;
          }

          if (errorGetAddress) {
            response['function'] = 'error';
            response['payload'] = errorGetAddress;
          }
          contentWindow.postMessage(response, origin);
        } else if (method === 'disconnect') {
          window.arweaveWallet.disconnect();
          response['function'] = 'disconnected';
          contentWindow.postMessage(response, origin);
        } else {
          response['function'] = 'error';
          response['payload'] = 'Method not found';
          contentWindow.postMessage(response, origin);
        }
      }
    },
    async parseCode(source, isCurrentSource) {
      if (this.wasm) {
        if (!(source.srcBinary instanceof Buffer)) {
          source.srcBinary = Buffer.from(source.srcBinary.data);
        }
        const wasmSrc = new WasmSrc(source.srcBinary);
        let contractSrc;
        try {
          contractSrc = await wasmSrc.sourceCode();
        } catch (e) {
          this.loaded = true;
          this.correct = false;
        }
        let objFromContractSrc = Object.fromEntries(contractSrc);

        if (source.srcWasmLang == 'assemblyscript') {
          this.contractSrc = this.getAs(objFromContractSrc);
        } else if (source.srcWasmLang == 'rust') {
          this.contractSrc = this.getRust(objFromContractSrc);
        } else if (source.srcWasmLang == 'go') {
          this.contractSrc = this.getGo(objFromContractSrc);
        }
        if (isCurrentSource == true) {
          this.currentSrcVersion = this.contractSrc;
        }
        this.loaded = true;
      } else {
        this.contractSrc = source.src;
        if (isCurrentSource == true) {
          this.currentSrcVersion = this.contractSrc;
        }
        this.loaded = true;
      }
    },

    async changeCodeSource(code, index) {
      this.activeItem = index;
      this.renderComponent = false;
      await this.parseCode(code);
      await this.$nextTick();
      this.renderComponent = true;
    },
  },
};
</script>

<style scoped lang="scss">
.code-container {
  display: flex;
  min-height: 700px;
  width: 100%;

  .source-code-wrapper {
    width: 85%;
  }

  .version-nav {
    width: 15%;
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
    nav {
      width: 100%;
      padding-left: 1rem;
      p {
        text-align: center;
      }
      ul {
        li {
          position: relative;
          width: 100%;
          height: 2.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 1.5rem 0;
          cursor: pointer;
          color: #a8a8a8;
          transition: color 0.2s ease;
          border: 1px solid grey;
          border-radius: 5px;
          overflow: hidden;
          padding: 0.5rem;
          height: 4rem;
          box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
          &:hover {
            color: #5e5e5e;
          }

          .chosen-icon {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 1.6rem;
            height: 1.6rem;
            filter: invert(42%) sepia(84%) saturate(1521%) hue-rotate(207deg) brightness(101%) contrast(89%);
          }
        }
        .active-item {
          border: 2px solid var(--warp-blue-color);
          box-shadow: rgba(89, 130, 241, 0.3) 0px 1px 2px 0px, rgba(89, 130, 241, 0.15) 0px 2px 6px 2px;
          color: #5e5e5e;
          &:hover {
            border: 2px solid var(--warp-blue-color);
          }
        }
      }
    }
  }
}
</style>
