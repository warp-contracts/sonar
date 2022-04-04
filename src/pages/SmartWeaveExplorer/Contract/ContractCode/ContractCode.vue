<template>
  <div class="code-container">
    <div v-if="!loaded" class="state-container">
      Loading Contract Code...
    </div>
    <pre v-show="loaded && contractSrc && !wasm"><code class="language-javascript">{{contractSrc}}</code></pre>
    <div v-show="loaded && contractSrc && wasm">
      <ul id="code-wasm">
        <li v-for="(item, idx) in contractSrc" :key="idx">
          <pre><code class="language-javascript">{{contractSrc[idx]}}</code></pre>
        </li>
      </ul>
    </div>

    <iframe
      v-show="loaded && !isTestnet && !wasm"
      ref="arcode"
      id="arcode"
      title="ArCode iframe"
      width="100%"
      height="700px"
      frameBorder="0"
      :src="getCodeSrc()"
    >
    </iframe>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import { WasmSrc, getTag, ArweaveWrapper } from 'redstone-smartweave';

export default {
  name: 'ContractCode',
  props: {
    contractId: String,
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
      axios.get(`${this.gatewayUrl}/gateway/contracts/${this.contractId}`).then(async (fetchedContract) => {
        const arweaveWrapper = new ArweaveWrapper(this.isTestnet ? this.arweaveTest : this.arweave);
        const srcTxData = await arweaveWrapper.txData(fetchedContract.data.srcTxId);
        const wasmSrc = new WasmSrc(srcTxData);
        const contractSrc = await wasmSrc.sourceCode();
        const objFromContractSrc = Object.fromEntries(contractSrc);
        this.contractSrc = objFromContractSrc;
        this.loaded = true;
      });
    } else {
      if (this.isTestnet) {
        axios.get(`${this.gatewayUrl}/gateway/contracts/${this.contractId}`).then((fetchedContract) => {
          this.contractSrc = fetchedContract.data.src;
          this.loaded = true;
        });
      } else {
        const contentWindow = document.getElementById('arcode').contentWindow;
        window.addEventListener(
          'message',
          async (event) => {
            const origin = event.origin;

            const frameEvent = `${event.data.event}`.trim();
            await this.handleCalls(frameEvent, event, contentWindow, origin);
          },
          false
        );
      }
    }
  },
  methods: {
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
    getCodeSrc() {
      return `https://arcode.studio/#/${this.contractId}/${window.innerHeight < 768 ? '?hideToolbar=1' : ''}`;
    },
  },
};
</script>

<style>
.code-container {
  min-height: 700px;
  width: 100%;
}
</style>
