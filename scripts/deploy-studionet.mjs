import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { CalldataAddress, ExecutionResult, TransactionStatus } from "genlayer-js/types";

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
  const statusName = receipt.statusName ?? receipt.status_name;
  const resultName = receipt.resultName ?? receipt.result_name;
  const executionName = receipt.txExecutionResultName ?? receipt.tx_execution_result_name;
  const leaderReceipts = receipt.consensus_data?.leader_receipt ?? [];
  const contractErrors = leaderReceipts.filter((entry) => entry.execution_result === "ERROR" || entry.result?.status === "contract_error");
  if (contractErrors.length > 0) {
    const stderr = contractErrors[0].genvm_result?.stderr ?? contractErrors[0].result?.payload ?? "contract_error";
    throw new Error(`${label} contract execution failed: ${String(stderr).slice(0, 1200)}`);
  }
  if (executionName && executionName !== ExecutionResult.FINISHED_WITH_RETURN) {
    throw new Error(`${label} finalized without successful execution: ${statusName} / ${executionName}`);
  }
  if (statusName && statusName !== TransactionStatus.FINALIZED) {
    throw new Error(`${label} did not finalize: ${statusName}`);
  }
  if (resultName && resultName !== "MAJORITY_AGREE") {
    throw new Error(`${label} consensus result was not majority agree: ${resultName}`);
  }
  return receipt;
}

function deployedAddress(receipt) {
  return receipt.recipient ?? receipt.to_address ?? receipt.txDataDecoded?.contractAddress ?? receipt.data?.contract_address ?? receipt.data?.contractAddress;
}

function calldataAddress(address) {
  const clean = address.replace(/^0x/i, "");
  return new CalldataAddress(Uint8Array.from(Buffer.from(clean, "hex")));
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

let tasksTx = process.env.GLYPHWORK_EXISTING_TASKS_TX;
let tasksReceipt = null;
let tasksAddress = process.env.GLYPHWORK_EXISTING_TASKS_ADDRESS;
if (tasksAddress) {
  console.log(`Reusing existing Tasks contract: ${tasksAddress}`);
  if (tasksTx) {
    tasksReceipt = await wait(client, tasksTx, "Existing Tasks deployment");
  }
} else {
  tasksTx = await client.deployContract({ account, code: sources.tasks.toString("utf8") });
  console.log(`Tasks deploy tx: ${tasksTx}`);
  tasksReceipt = await wait(client, tasksTx, "Tasks deployment");
  tasksAddress = deployedAddress(tasksReceipt);
}
if (!tasksAddress) {
  throw new Error("Tasks deployment finalized, but the SDK receipt did not expose a contract address. Inspect deployment-evidence/latest.json for the raw receipt.");
}

const vaultTx = await client.deployContract({ account, code: sources.vault.toString("utf8"), args: [calldataAddress(tasksAddress)] });
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
  args: [calldataAddress(vaultAddress)],
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
