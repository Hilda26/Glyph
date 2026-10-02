import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionHashVariant, TransactionStatus } from "genlayer-js/types";

const TASKS = "0x2Eb674387e52c79A9Ee48ee2a01630c959c9630d";
const VAULT = "0xd13622176dDA146d2c86DB10c8b2b29bDbEf7BF8";
const SOURCE_URL = "https://raw.githubusercontent.com/Hilda26/Glyph/main/public/fixtures/typed-notice.png";
const REWARD_WEI = 1_000_000_000_000_000n;

const privateKey = process.env.GLYPHWORK_DEPLOYER_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Set GLYPHWORK_DEPLOYER_PRIVATE_KEY in the process environment.");
}

const sourceBytes = Buffer.from(await (await fetch(SOURCE_URL)).arrayBuffer());
const expectedHash = createHash("sha256").update(sourceBytes).digest("hex");
const account = createAccount(privateKey);
const client = createClient({
  chain: studionet,
  endpoint: "https://studio.genlayer.com/api",
  account,
});

async function wait(hash, label) {
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 5_000,
    retries: 180,
  });
  const leader = receipt.consensus_data?.leader_receipt?.[0];
  const stderr = leader?.genvm_result?.stderr;
  if (stderr || leader?.result?.status === "contract_error") {
    throw new Error(`${label} failed: ${stderr ?? leader.result.payload}`);
  }
  return receipt;
}

async function write(label, address, functionName, args, value = 0n) {
  console.log(`${label}: submitting ${functionName}`);
  const hash = await client.writeContract({
    account,
    address,
    functionName,
    args,
    value,
  });
  console.log(`${label}: ${hash}`);
  const receipt = await wait(hash, label);
  return { hash, receipt };
}

async function read(address, functionName, args = []) {
  return client.readContract({
    address,
    functionName,
    args,
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
}

const bountyCountBefore = BigInt(await read(TASKS, "get_bounty_count"));
const deadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
const lifecycle = {};

lifecycle.createDraft = await write("createDraft", TASKS, "create_draft", [
  "Live harbor notice transcription",
  "GitHub raw typed notice fixture",
  SOURCE_URL,
  expectedHash,
  "PLAIN_TEXT",
  [],
  "Transcribe all visible lines exactly enough to preserve line order. Minor punctuation variance is acceptable.",
  REWARD_WEI.toString(),
  deadline,
  3,
  true,
]);

const bountyCountAfter = BigInt(await read(TASKS, "get_bounty_count"));
const bountyId = bountyCountAfter.toString();
if (bountyCountAfter !== bountyCountBefore + 1n) {
  throw new Error(`Unexpected bounty count transition: ${bountyCountBefore} -> ${bountyCountAfter}`);
}

lifecycle.fund = await write("fund", VAULT, "fund_bounty", [bountyId], REWARD_WEI);
lifecycle.open = await write("verifySourceAndOpen", TASKS, "verify_source_and_open", [bountyId]);

const transcription = [
  "NOTICE TO HARBOR CARRIERS",
  "Port office circular 17. Public record.",
  "North gate opens at six bells.",
  "Lamp oil: twelve tins received.",
  "Clerk: Mara Vell, ledger mark B-41.",
  "Filed for municipal archive, 1908.",
].join("\n");

lifecycle.submit = await write("submit", TASKS, "submit_transcription", [
  bountyId,
  transcription,
  false,
  "Live test submission from deployed Glyphwork app flow.",
]);

const submissionCount = BigInt(await read(TASKS, "get_submission_count"));
const submissionId = submissionCount.toString();

lifecycle.evaluate = await write("evaluate", TASKS, "evaluate_active_submission", [bountyId]);

const bounty = await read(TASKS, "get_bounty", [bountyId]);
const submission = await read(TASKS, "get_submission", [submissionId]);
const conservation = await read(VAULT, "conservation");

const result = {
  recordedAt: new Date().toISOString(),
  network: {
    name: "Studionet",
    chainId: 61999,
    rpc: "https://studio.genlayer.com/api",
  },
  signer: account.address,
  source: {
    url: SOURCE_URL,
    bytes: sourceBytes.length,
    sha256: expectedHash,
  },
  contracts: {
    tasks: TASKS,
    vault: VAULT,
  },
  bountyId,
  submissionId,
  rewardWei: REWARD_WEI.toString(),
  deadline,
  transactions: Object.fromEntries(Object.entries(lifecycle).map(([key, value]) => [key, value.hash])),
  explorer: Object.fromEntries(
    Object.entries(lifecycle).map(([key, value]) => [key, `https://explorer-studio.genlayer.com/transactions/${value.hash}`]),
  ),
  readbacks: {
    bounty,
    submission,
    conservation,
  },
};

mkdirSync("docs/deployment-evidence", { recursive: true });
writeFileSync("docs/deployment-evidence/live-demo.json", `${JSON.stringify(result, null, 2)}\n`);

const latestPath = "docs/deployment-evidence/latest.json";
const latest = JSON.parse(readFileSync(latestPath, "utf8"));
latest.liveDemo = {
  recordedAt: result.recordedAt,
  bountyId,
  submissionId,
  transactions: result.transactions,
  explorer: result.explorer,
  readbacks: result.readbacks,
};
writeFileSync(latestPath, `${JSON.stringify(latest, null, 2)}\n`);

console.log(JSON.stringify({
  bountyId,
  submissionId,
  transactions: result.transactions,
  conservation: Array.isArray(conservation) ? conservation.map(String) : conservation,
}, null, 2));
