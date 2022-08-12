<template>
  <div class="code-container">
    <div v-if="!loaded" class="state-container">
      Loading Contract Code...
    </div>
    <pre v-if="loaded && contractSrc && !wasm"><code class="language-javascript">{{contractSrc}}</code></pre>
    <div v-if="loaded && contractSrc && wasm">
      <ul id="code-wasm">
        <li v-for="(item, idx) in contractSrc" :key="idx">
          <pre class="py-4"><code>{{ idx.substring(idx.split('/', 4).join('/').length + 1) }}</code></pre>

          <pre><code class="language-javascript">{{contractSrc[idx]}}</code></pre>
        </li>
      </ul>
    </div>

    <!-- temporary - until ArCode loads contract's code from the redstone gateway -->
    <!-- <iframe
      v-show="loaded && !isTestnet && !wasm"
      ref="arcode"
      id="arcode"
      title="ArCode iframe"
      width="100%"
      height="700px"
      frameBorder="0"
      :src="getCodeSrc()"
    >
    </iframe> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import { WasmSrc } from 'warp-contracts';

export default {
  name: 'ContractCode',
  props: {
    sourceId: String,
    wasm: Boolean,
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'isTestnet', 'arweave', 'arweaveTest']),
  },
  data() {
    return {
      loaded: false,
      code: null,
      contractSrc: null,
    };
  },
  updated: function() {
    Prism.highlightAll();
  },
  async mounted() {
    if (this.wasm) {
      axios.get(`${this.gatewayUrl}/gateway/contract-source?id=${this.sourceId}`).then(async (fetchedSource) => {
        if (!(fetchedSource.data.srcBinary instanceof Buffer)) {
          fetchedSource.data.srcBinary = Buffer.from(fetchedSource.data.srcBinary.data);
        }
        const wasmSrc = new WasmSrc(fetchedSource.data.srcBinary);
        const contractSrc = await wasmSrc.sourceCode();
        let objFromContractSrc = Object.fromEntries(contractSrc);

        if (fetchedSource.data.srcWasmLang == 'assemblyscript') {
          this.contractSrc = this.getAs(objFromContractSrc);
        } else if (fetchedSource.data.srcWasmLang == 'rust') {
          this.contractSrc = this.getRust(objFromContractSrc);
        } else if (fetchedSource.data.srcWasmLang == 'go') {
          this.contractSrc = this.getGo(objFromContractSrc);
        }
        this.loaded = true;
      });
    } else {
      // temporary until ArCode loads contracrt from the RedStone gateway
      // if (this.isTestnet) {
      axios.get(`${this.gatewayUrl}/gateway/contract-source?id=${this.sourceId}`).then((fetchedSource) => {
        this.contractSrc = fetchedSource.data.src;
        this.loaded = true;
      });
      //   } else {
      //     const contentWindow = document.getElementById('arcode').contentWindow;
      //     window.addEventListener(
      //       'message',
      //       async (event) => {
      //         const origin = event.origin;

      //         const frameEvent = `${event.data.event}`.trim();
      //         await this.handleCalls(frameEvent, event, contentWindow, origin);
      //       },
      //       false
      //     );
      //   }
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
    // getCodeSrc() {
    //   return `https://arcode.studio/#/${this.contractId}/${window.innerHeight < 768 ? '?hideToolbar=1' : ''}`;
    // },
  },
};
</script>

<style>
.code-container {
  min-height: 700px;
  width: 100%;
}
</style>
