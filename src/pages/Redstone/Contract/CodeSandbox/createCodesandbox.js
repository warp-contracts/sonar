import Arweave from "arweave";
import {ContractDefinitionLoader} from "redstone-smartweave";
import {indexContent} from "./indexContent";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 20000,
  logging: false
});

const definitionLoader = new ContractDefinitionLoader(arweave);

function generateIframeData(sandbox_id) {
  const url = `https://codesandbox.io/embed/${sandbox_id}?codemirror=1&module=/src/contract.js&theme=dark&view=editor&editorsize=100`;
  return {
    src: url,
    style: {
      width: "100%",
      height: "600px",
      border: 0,
      borderRadius: "4px",
      overflow: "hidden"
    },
    sandbox:
      "allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
  };
}

export async function createCodesandbox(contractTxId) {
  const contractDefinition = await definitionLoader.load(contractTxId);

  return fetch("https://codesandbox.io/api/v1/sandboxes/define?json=1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      files: {
        "package.json": {
          content: {
            name: `redstone-codesandbox-${contractDefinition.txId}`,
            version: "1.0.0",
            description: "SmartWeave contract template",
            main: "src/index.ts",
            scripts: {
              start: "nodemon --exec ts-node src/index.ts"
            },
            dependencies: {
              "@types/node": "^16.7.1",
              arlocal: "1.1.13",
              arweave: "1.10.18",
              "redstone-smartweave": "0.4.8",
              "ts-node": "10.4.0",
              typescript: "4.5.4"
            },
            devDependencies: {
              nodemon: "2.0.15"
            }
          }
        },
        "sandbox.config.json": {
          content: {
            infiniteLoopProtection: true,
            hardReloadOnChange: false,
            view: "browser",
            container: {
              node: "16"
            }
          }
        },
        "tsconfig.json": {
          content: {
            include: [
              "./src/*"
            ],
            compilerOptions: {
              lib: [
                "esnext"
              ],
              esModuleInterop: true
            }
          }
        },
        "src/contract.js": {
          content: contractDefinition.src
        },
        "src/init-state.json": {
          content: contractDefinition.initState
        },
        "src/index.ts": {
          content: indexContent
        }
      }
    })
  })
    .then((x) => x.json())
    .then((data) => generateIframeData(data.sandbox_id));
}
