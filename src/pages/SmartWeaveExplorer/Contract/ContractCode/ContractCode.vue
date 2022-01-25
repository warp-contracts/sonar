<template>
  <div class="code-container">
    <div v-if="!loaded" class="state-container">
      Loading Contract Code...
    </div>
    <iframe
      v-show="loaded"
      ref="arcode"
      id="arcode"
      title="ArCode iframe"
      width="100%"
      height="100%"
      frameBorder="0"
      :src="getCodeSrc()"
    >
    </iframe>
  </div>
</template>

<script>
export default {
  name: "ContractCode",
  props: {
    contractId: String,
  },
  data() {
    return {
      loaded: false,
    };
  },
  mounted() {
    const contentWindow = document.getElementById("arcode").contentWindow;
    window.addEventListener(
      "message",
      async (event) => {
        const origin = event.origin;

        const frameEvent = `${event.data.event}`.trim();
        await this.handleCalls(frameEvent, event, contentWindow, origin);
      },
      false
    );
  },
  methods: {
    async handleCalls(frameEvent, event, contentWindow, origin) {
      if (frameEvent === "arCodeLoaded") {
        this.loaded = true;
      } else if (frameEvent === "arcodeAction") {
        const payload = event.data.payload;
        const method = payload.method;
        const reqId = event.data.id;
        const response = {
          function: "",
          payload: "",
          id: reqId,
        };

        if (method !== "startHandshake" && !window.arweaveWallet) {
          response["function"] = "error";
          response["payload"] = "ArConnect/Finnie not detected!";
          contentWindow.postMessage(response, origin);
          return;
        }

        if (method === "startHandshake") {
          response["function"] = "handshake";
          response["payload"] = "bridgeActive";
          contentWindow.postMessage(response, origin);
        } else if (method === "sign") {
          let errorSigning = "";
          const tx = payload.data.transaction;
          const options = payload.data.options;
          response["function"] = "signedTransaction";

          try {
            await window.arweaveWallet.connect(["SIGN_TRANSACTION"]);
            const signedTransaction = await window.arweaveWallet.sign(
              tx,
              options
            );
            response["payload"] = signedTransaction;
          } catch (err) {
            console.log("Error, trying to sign tx ... ", err);
            errorSigning = err;
          }

          if (errorSigning) {
            response["function"] = "error";
            response["payload"] = errorSigning;
          }
          contentWindow.postMessage(response, origin);
        } else if (method === "getAddress") {
          let wallet = "";
          let errorGetAddress = "";
          response["function"] = "address";
          try {
            await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);
            wallet = await window.arweaveWallet.getActiveAddress();
            response["payload"] = wallet;
          } catch (err) {
            console.log("Error, trying to connect... ", err);
            errorGetAddress = err;
          }

          if (errorGetAddress) {
            response["function"] = "error";
            response["payload"] = errorGetAddress;
          }
          contentWindow.postMessage(response, origin);
        } else if (method === "disconnect") {
          window.arweaveWallet.disconnect();
          response["function"] = "disconnected";
          contentWindow.postMessage(response, origin);
        } else {
          response["function"] = "error";
          response["payload"] = "Method not found";
          contentWindow.postMessage(response, origin);
        }
      }
    },
    getCodeSrc() {
      return `https://arcode.studio/#/${this.contractId}/${
        window.innerHeight < 768 ? "?hideToolbar=1" : ""
      }`;
    },
  },

  components: {},
};
</script>

<style>
.code-container {
  height: 700px;
  width: 100%;
}
</style>
