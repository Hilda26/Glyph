import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const rpc = process.env.GENLAYER_RPC ?? "https://studio.genlayer.com/api";
if (rpc !== "https://studio.genlayer.com/api") {
  throw new Error("Deployment is locked to Studionet RPC https://studio.genlayer.com/api");
}

const privateKey = process.env.GLYPHWORK_DEPLOYER_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Set GLYPHWORK_DEPLOYER_PRIVATE_KEY for a funded Studionet signer. The key is read from the environment and is never written.");
}

const sources = {
  tasks: readFileSync("contracts/glyphwork_tasks.py"),
  vault: readFileSync("contracts/glyphwork_vault.py"),
};

function sourceEvidence(buffer) {
  return {
    bytes: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
  };
}

async function wait(client, hash, label) {
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 5_000,
    retries: 180,
  });
  if (receipt.txExecutionResultName !== ExecutionResult.FINISHED_WITH_RETURN) {
    throw new Error(`${label} finalized without successful execution: ${receipt.statusName} / ${receipt.txExecutionResultName}`);
  }
  return receipt;
}

function deployedAddress(receipt) {
  return receipt.recipient ?? receipt.to_address ?? receipt.txDataDecoded?.contractAddress ?? receipt.data?.contract_address ?? receipt.data?.contractAddress;
}

const account = createAccount(privateKey);
const client = createClient({
  chain: studionet,
  endpoint: rpc,
  account,
});

console.log(`Deploying from ${account.address} to Studionet 61999...`);
console.log(`tasks bytes=${sources.tasks.length} sha256=${sourceEvidence(sources.tasks).sha256}`);
console.log(`vault bytes=${sources.vault.length} sha256=${sourceEvidence(sources.vault).sha256}`);

const tasksTx = await client.deployContract({ account, code: sources.tasks.toString("utf8") });
console.log(`Tasks deploy tx: ${tasksTx}`);
const tasksReceipt = await wait(client, tasksTx, "Tasks deployment");
const tasksAddress = deployedAddress(tasksReceipt);
if (!tasksAddress) {
  throw new Error("Tasks deployment finalized, but the SDK receipt did not expose a contract address. Inspect deployment-evidence/latest.json for the raw receipt.");
}

const vaultTx = await client.deployContract({ account, code: sources.vault.toString("utf8"), args: [tasksAddress] });
console.log(`Vault deploy tx: ${vaultTx}`);
const vaultReceipt = await wait(client, vaultTx, "Vault deployment");
const vaultAddress = deployedAddress(vaultReceipt);
if (!vaultAddress) {
  throw new Error("Vault deployment finalized, but the SDK receipt did not expose a contract address. Inspect deployment-evidence/latest.json for the raw receipt.");
}

const bindTx = await client.writeContract({
  account,
  address: tasksAddress,
  functionName: "set_vault_once",
  args: [vaultAddress],
  value: 0n,
});
console.log(`set_vault_once tx: ${bindTx}`);
const bindReceipt = await wait(client, bindTx, "Vault binding");

const evidence = {
  network: {
    name: "Studionet",
    chainId: 61999,
    rpc,
    explorer: "https://explorer-studio.genlayer.com",
  },
  signer: account.address,
  sources: {
    tasks: sourceEvidence(sources.tasks),
    vault: sourceEvidence(sources.vault),
  },
  contracts: {
    tasks: tasksAddress,
    vault: vaultAddress,
  },
  transactions: {
    tasksDeploy: tasksTx,
    vaultDeploy: vaultTx,
    bindVault: bindTx,
  },
  receipts: {
    tasksDeploy: tasksReceipt,
    vaultDeploy: vaultReceipt,
    bindVault: bindReceipt,
  },
};

mkdirSync("docs/deployment-evidence", { recursive: true });
writeFileSync("docs/deployment-evidence/latest.json", `${JSON.stringify(evidence, null, 2)}\n`);

console.log("Deployment complete.");
console.log(`NEXT_PUBLIC_GLYPHWORK_TASKS_ADDRESS=${tasksAddress}`);
console.log(`NEXT_PUBLIC_GLYPHWORK_VAULT_ADDRESS=${vaultAddress}`);
console.log("Evidence written to docs/deployment-evidence/latest.json");
