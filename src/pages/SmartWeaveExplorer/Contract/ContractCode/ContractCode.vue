<template>
  <div class="code-container">
    <div class="version-nav" v-if="loaded && contractSrcHistory?.length > 1">
      <nav>
        <p class="source-nav-heading">Contract Source History</p>
        <ul>
          <li
            v-for="(version, key) in preparedSource"
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
              <p class="text-nowrap mb-0">
                {{ version.age }}
              </p>
              <p class="mb-0">{{ version.srcTxId | tx }}</p>
            </div>
          </li>
        </ul>
        <p class="source-nav-heading">Compare Source</p>
        <p v-if="wasm">Currently unavailable for WASM contracts</p>
        <ul class="compare-source-list" v-if="!wasm && loaded && contractSrcHistory?.length > 1">
          <li
            v-for="(version, key) in preparedSource"
            :key="key"
            @click="changeCompareSource(version, key)"
            :class="{ 'active-compare-item': activeCompareItem == key }"
          >
            <img
              v-if="activeCompareItem == key"
              src="../../../../assets/icons/tick-circle.svg"
              alt="active item circle tick icon"
              class="chosen-icon chosen-compare-icon"
            />
            <div class="d-flex flex-column">
              <p class="text-nowrap mb-0">
                {{ version.age }}
              </p>
              <p class="mb-0">{{ version.srcTxId | tx }}</p>
            </div>
          </li>
        </ul>
      </nav>
    </div>
    <div class="source-code-wrapper" :class="contractSrcHistory?.length > 1 ? 'code-partView' : 'code-fullView'">
      <div class="code-header">
        <a v-if="!isSourceView" class="current-id" :href="`/#/app/source/${currentSrcTxId}?network=${network}`">{{
          currentSrcTxId
        }}</a>
        <div
          v-if="!wasm"
          class="copy-source"
          title="Copy to clipboard"
          v-clipboard:success="onCopy"
          v-clipboard="() => contractSrc"
        >
          <p>Copy source code</p>
          <div class="flaticon-copy-to-clipboard">
            <p v-if="copiedDisplay" class="clipboard-success copy-info">Copied</p>
          </div>
        </div>
      </div>
      <div v-if="loaded && contractSrc && !wasm && renderComponent">
        <code-diff
          :old-string="sourceToCompare"
          :new-string="contractSrc"
          output-format="line-by-line"
          language="js"
          :context="100"
        />
      </div>
      <div v-if="loaded && !correct" class="state-container">Could not retrieve Contract Code.</div>

      <div v-if="loaded && contractSrc && wasm">
        <ul id="code-wasm">
          <li v-for="(item, idx) in contractSrc" :key="idx">
            <pre class="py-4"><code>{{ idx.substring(idx.split('/', 4).join('/').length + 1) }}</code></pre>
            <code-diff
              :old-string="contractSrc[idx]"
              :new-string="contractSrc[idx]"
              output-format="line-by-line"
              language="js"
              :context="100"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import { WasmSrc } from 'warp-contracts';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { convertTime } from '@/utils';
import dayjs from 'dayjs';

const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

export default {
  name: 'ContractCode',
  components: {
    LoadingSpinner,
  },
  props: {
    contractId: String,
    sourceId: String,
    wasm: Boolean,
    source: Object,
    isSourceView: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'network', 'arweave']),
  },
  data() {
    return {
      loaded: false,
      correct: true,
      code: null,
      contractSrc: null,
      renderComponent: true,
      activeItem: 0,
      contractSrcHistory: [],
      initSrcVersion: null,
      preparedSource: [],
      currentSrcTxId: null,
      copiedDisplay: false,
      sourceToCompare: null,
      activeCompareItem: null,
    };
  },
  updated: function () {
    Prism.highlightAll();
  },

  async mounted() {
    if (!this.isSourceView) {
      this.contractSrcHistory = [...this.source.evolvedSrc, this.source];
      await this.prepareSource(this.contractSrcHistory);
      this.contractSrc = this.preparedSource[0].src;
      this.currentSrcTxId = this.preparedSource[0].srcTxId;
      this.sourceToCompare = this.contractSrc;
      await this.parseCode(this.preparedSource[0]);
    } else {
      await this.parseCode(this.source);
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
    async parseCode(source) {
      if (source.srcWasmLang) {
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
        this.loaded = true;
      } else {
        this.contractSrc = source.src;
        this.loaded = true;
      }
      this.currentSrcTxId = source.srcTxId;
      this.sourceToCompare = this.contractSrc;
      this.loaded = true;
    },

    async changeCodeSource(code, index) {
      this.activeItem = index;
      this.renderComponent = false;
      await this.parseCode(code);
      await this.$nextTick();
      this.renderComponent = true;
    },
    changeCompareSource(code, index) {
      if (index == this.activeCompareItem) {
        this.activeCompareItem = null;
        this.sourceToCompare = this.contractSrc;
      } else {
        this.sourceToCompare = code.src;
        this.activeCompareItem = index;
      }
    },
    convertTime: convertTime,
    prepareSource(source) {
      source.forEach((el) => {
        this.preparedSource.push({
          src: el.src,
          srcBinary: el.srcBinary,
          srcWasmLang: el.srcWasmLang,
          srcTxId: el.srcTxId,
          age: el.blockTimestamp
            ? convertTime(dayjs.unix(el.blockTimestamp))
            : convertTime(dayjs.unix(Math.trunc(el.sortKey.split(',')[1] / 1000))),
        });
      });
    },
    onCopy() {
      this.copiedDisplay = true;
      setTimeout(() => (this.copiedDisplay = false), 2000);
    },
  },
};
</script>

<style scoped lang="scss">
.code-container {
  display: flex;
  min-height: 700px;
  width: 100%;

  .code-fullView {
    width: 100%;
  }

  .code-partView {
    width: 85%;
  }
  .source-code-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;

    .code-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      .current-id {
        text-align: center;
      }
      .copy-source {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;

        p {
          margin: 0;
          cursor: pointer;
        }
      }
    }
  }

  .flaticon-copy-to-clipboard {
    position: relative;
    margin-bottom: 0.2rem;
    margin-left: 0.4rem;

    .copy-info {
      position: absolute;
      top: -1.2rem;
      right: 0;
    }
  }

  .version-nav {
    width: 15%;
    display: flex;
    justify-content: center;
    nav {
      width: 100%;
      padding-right: 1rem;
      p {
        text-align: center;
      }
      ul {
        li:first-child {
          margin-top: 0;
        }
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

          .chosen-compare-icon {
            filter: invert(60%) sepia(10%) saturate(6279%) hue-rotate(306deg) brightness(94%) contrast(95%);
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
        .active-compare-item {
          border: 2px solid #ea6387;
          box-shadow: rgba(234, 99, 135, 0.3) 0px 1px 2px 0px, rgba(89, 130, 241, 0.15) 0px 2px 6px 2px;
          color: #5e5e5e;
        }
      }
      .source-nav-heading {
        font-weight: bold;
      }
    }
  }
}

@media (max-width: 768px) {
  .code-container {
    .code-header {
      flex-direction: column-reverse;
      align-items: center;

      .current-id {
        margin-top: 1rem;
        font-size: 0.8rem;
        white-space: nowrap;
      }
    }
  }
}

@media (max-width: 1024px) {
  .code-container {
    flex-direction: column;

    .source-code-wrapper {
      width: 100%;
    }

    .version-nav {
      width: 100%;
    }

    .current-id {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
