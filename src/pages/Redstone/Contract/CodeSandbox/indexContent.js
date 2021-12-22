export const indexContent = `
import fs from "fs";
import ArLocal from "arlocal";
import Arweave from "arweave";
import {
  Contract,
  LoggerFactory,
  SmartWeave,
  SmartWeaveNodeFactory
} from "redstone-smartweave";
import { JWKInterface } from "arweave/node/lib/wallet";

LoggerFactory.INST.logLevel("debug");

const arlocal = new ArLocal(1982, false);
const arweave = Arweave.init({
  host: "localhost",
  port: 1982,
  protocol: "http"
});
let wallet: JWKInterface;

const smartweave = SmartWeaveNodeFactory.memCached(arweave);

async function addFunds(arweave: Arweave, wallet: JWKInterface) {
  const walletAddress = await arweave.wallets.getAddress(wallet);
  await arweave.api.get(\`/mint/\${walletAddress}/1000000000000000\`);
}

async function mine() {
  await arweave.api.get("mine");
}

async function main() {
  await arlocal.start();
  
  console.log("ArLocal started");

  wallet = await arweave.wallets.generate();
  await addFunds(arweave, wallet);

  const contractTxId = await smartweave.createContract.deploy({
    wallet,
    initState: fs.readFileSync("./src/init-state.json", "utf8"),
    src: fs.readFileSync("./src/contract.js", "utf8")
  });
  
  console.log("Contract deployed on ArLocal");
  
  const contract = smartweave.contract(contractTxId).connect(wallet);

  let contractState = await contract.readState();
  console.log(contractState);

  /* TODO: write your interaction*/
  await contract.writeInteraction({});
  await mine();

  const {state, validity} = await contract.readState();
  console.log("Result", {state, validity});
}

console.log("Hello World!");

main().catch((e) => console.error(e));
`;
