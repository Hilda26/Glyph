import { z } from "zod";

export const schemaModeSchema = z.enum(["PLAIN_TEXT", "KEY_VALUE"]);
export const bountyStatusSchema = z.enum([
  "DRAFT",
  "FUNDED",
  "OPEN",
  "SUBMITTED",
  "EVALUATING",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "PAID",
  "REFUNDED",
]);
export const evaluationResultSchema = z.enum(["ACCEPT", "REJECT", "INCONCLUSIVE", "UNAVAILABLE"]);

export type SchemaMode = z.infer<typeof schemaModeSchema>;
export type BountyStatus = z.infer<typeof bountyStatusSchema>;
export type EvaluationResult = z.infer<typeof evaluationResultSchema>;

export type BountySummary = {
  id: string;
  sponsor: `0x${string}`;
  title: string;
  sourceLabel: string;
  sourceUrl: string;
  expectedHash: string;
  schemaMode: SchemaMode;
  fieldLabels: string[];
  transcriptionRules: string;
  acceptMinorErrors: boolean;
  rewardWei: bigint;
  deadline: number;
  attempts: number;
  maxAttempts: number;
  status: BountyStatus;
  definitionHash: string;
};

export type SubmissionReceipt = {
  id: string;
  bountyId: string;
  worker: `0x${string}`;
  result: EvaluationResult;
  reason: string;
  paid: boolean;
  refunded: boolean;
  sourceMatch: "MATCH" | "MISMATCH" | "UNCLEAR";
  completeness: "COMPLETE" | "MINOR_OMISSIONS" | "MAJOR_OMISSIONS" | "UNCLEAR";
  accuracy: "ACCURATE" | "MINOR_ERRORS" | "MATERIAL_ERRORS" | "UNCLEAR";
  transcript: string;
};
