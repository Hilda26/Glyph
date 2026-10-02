import { createClient } from "genlayer-js";
import { ExecutionResult, TransactionHashVariant, TransactionStatus, type CalldataEncodable } from "genlayer-js/types";
import { glyphworkNetwork } from "@/lib/genlayer/network";
import { contractAddresses, hasDeployedContracts } from "./addresses";
import type { BountySummary, SubmissionReceipt } from "./types";

type Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export function createReadClient() {
  return createClient({ chain: glyphworkNetwork });
}

export function createWalletClient(provider: Provider, account: `0x${string}`) {
  return createClient({
    chain: glyphworkNetwork,
    account,
    provider: provider as unknown as NonNullable<Parameters<typeof createClient>[0]>["provider"],
  });
}

export async function readOpenBounties(): Promise<BountySummary[]> {
  const bounties = await readAllBounties();
  return bounties.filter((bounty) => ["OPEN", "SUBMITTED", "EVALUATING", "REJECTED"].includes(bounty.status));
}

export async function readAllBounties(): Promise<BountySummary[]> {
  if (!hasDeployedContracts()) return [];
  const client = createReadClient();
  const count = await client.readContract({
    address: contractAddresses.tasks as `0x${string}`,
    functionName: "get_bounty_count",
    args: [],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
  const total = Number(count);
  const bounties: BountySummary[] = [];
  for (let id = 1; id <= total; id += 1) {
    bounties.push(await readBounty(String(id)));
  }
  return bounties;
}

export async function readAllSubmissions(): Promise<SubmissionReceipt[]> {
  if (!hasDeployedContracts()) return [];
  const client = createReadClient();
  const count = await client.readContract({
    address: contractAddresses.tasks as `0x${string}`,
    functionName: "get_submission_count",
    args: [],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
  const total = Number(count);
  const submissions: SubmissionReceipt[] = [];
  for (let id = 1; id <= total; id += 1) {
    submissions.push(await readSubmission(String(id)));
  }
  return submissions;
}

export async function readCompletedSubmissions(): Promise<SubmissionReceipt[]> {
  const submissions = await readAllSubmissions();
  return submissions.filter((submission) => ["ACCEPT", "REJECT", "INCONCLUSIVE", "UNAVAILABLE"].includes(submission.result));
}

export async function readOpenBountyIds(): Promise<string[]> {
  const bounties = await readOpenBounties();
  return bounties.map((bounty) => bounty.id);
}

async function readRawBounty(id: string) {
  const client = createReadClient();
  return client.readContract({
    address: contractAddresses.tasks as `0x${string}`,
    functionName: "get_bounty",
    args: [id],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
}

export async function readBounty(id: string): Promise<BountySummary> {
  return normalizeBounty(await readRawBounty(id));
}

export async function readSubmission(id: string): Promise<SubmissionReceipt> {
  const client = createReadClient();
  const raw = await client.readContract({
    address: contractAddresses.tasks as `0x${string}`,
    functionName: "get_submission",
    args: [id],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
  const normalized = normalizeSubmission(raw);
  const settlement = await readVaultSettlement(normalized.bountyId);
  return { ...normalized, ...settlement };
}

export async function readVaultSettlement(bountyId: string): Promise<Pick<SubmissionReceipt, "paid" | "refunded">> {
  if (!hasDeployedContracts() || !bountyId) return { paid: false, refunded: false };
  const client = createReadClient();
  const readFlag = async (functionName: "was_paid" | "was_refunded") => {
    try {
      return Boolean(await client.readContract({
        address: contractAddresses.vault as `0x${string}`,
        functionName,
        args: [bountyId],
        transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
      }));
    } catch {
      return false;
    }
  };
  const [paid, refunded] = await Promise.all([readFlag("was_paid"), readFlag("was_refunded")]);
  return { paid, refunded };
}

export async function writeAndConfirm(options: {
  provider: Provider;
  account: `0x${string}`;
  address: string;
  functionName: string;
  args: CalldataEncodable[];
  value?: bigint;
  onStage: (stage: string, details?: string) => void;
}) {
  const client = createWalletClient(options.provider, options.account);
  await client.connect("studionet");
  options.onStage("AWAITING_SIGNATURE");
  const write = {
    address: options.address,
    functionName: options.functionName,
    args: options.args,
    value: options.value,
  };
  const hash = await client.writeContract({
    ...write,
    address: options.address as `0x${string}`,
    value: options.value ?? 0n,
  });
  options.onStage("SUBMITTED", hash);
  options.onStage("CONSENSUS_RUNNING", hash);
  const transaction = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
  });
  options.onStage("FINALIZED", hash);
  if (transaction.txExecutionResultName !== ExecutionResult.FINISHED_WITH_RETURN) {
    throw new Error(`${transaction.statusName ?? "CONSENSUS_FAILURE"} / ${transaction.txExecutionResultName ?? "EXECUTION_ERROR"}`);
  }
  options.onStage("EXECUTION_CONFIRMED", hash);
  options.onStage("STATE_REREAD", hash);
  return { hash, transaction };
}

function valueOf(record: Record<string, unknown>, camel: string, snake: string) {
  return record[camel] ?? record[snake];
}

function asBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  return 0n;
}

function normalizeBounty(raw: unknown): BountySummary {
  const item = raw as Record<string, unknown>;
  return {
    id: String(valueOf(item, "id", "id") ?? ""),
    sponsor: String(valueOf(item, "sponsor", "sponsor") ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
    title: String(valueOf(item, "title", "title") ?? ""),
    sourceLabel: String(valueOf(item, "sourceLabel", "source_label") ?? ""),
    sourceUrl: String(valueOf(item, "sourceUrl", "source_url") ?? ""),
    expectedHash: String(valueOf(item, "expectedHash", "expected_hash") ?? ""),
    schemaMode: String(valueOf(item, "schemaMode", "schema_mode") ?? "PLAIN_TEXT") as BountySummary["schemaMode"],
    fieldLabels: parseFieldLabels(valueOf(item, "fieldLabels", "field_labels") ?? valueOf(item, "fieldLabelsJson", "field_labels_json")),
    transcriptionRules: String(valueOf(item, "transcriptionRules", "transcription_rules") ?? ""),
    acceptMinorErrors: Boolean(valueOf(item, "acceptMinorErrors", "accept_minor_errors") ?? false),
    rewardWei: asBigInt(valueOf(item, "rewardWei", "reward_wei")),
    deadline: Number(valueOf(item, "deadline", "deadline") ?? 0),
    attempts: Number(valueOf(item, "attempts", "attempts") ?? 0),
    maxAttempts: Number(valueOf(item, "maxAttempts", "max_attempts") ?? 0),
    status: String(valueOf(item, "status", "status") ?? "DRAFT") as BountySummary["status"],
    definitionHash: String(valueOf(item, "definitionHash", "definition_hash") ?? ""),
  };
}

function parseFieldLabels(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.length > 0) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeSubmission(raw: unknown): SubmissionReceipt {
  const item = raw as Record<string, unknown>;
  return {
    id: String(valueOf(item, "id", "id") ?? ""),
    bountyId: String(valueOf(item, "bountyId", "bounty_id") ?? ""),
    worker: String(valueOf(item, "worker", "worker") ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
    result: String(valueOf(item, "result", "result") || "INCONCLUSIVE") as SubmissionReceipt["result"],
    reason: String(valueOf(item, "reason", "reason") ?? ""),
    paid: false,
    refunded: false,
    sourceMatch: String(valueOf(item, "sourceMatch", "source_match") || "UNCLEAR") as SubmissionReceipt["sourceMatch"],
    completeness: String(valueOf(item, "completeness", "completeness") || "UNCLEAR") as SubmissionReceipt["completeness"],
    accuracy: String(valueOf(item, "accuracy", "accuracy") || "UNCLEAR") as SubmissionReceipt["accuracy"],
    transcript: String(valueOf(item, "transcript", "transcription") ?? ""),
  };
}
