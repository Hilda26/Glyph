export const txStages = [
  "AWAITING_SIGNATURE",
  "SUBMITTED",
  "CONSENSUS_RUNNING",
  "FINALIZED",
  "EXECUTION_CONFIRMED",
  "STATE_REREAD",
] as const;

export const txFailures = [
  "USER_REJECTED",
  "WRONG_NETWORK",
  "RPC_ERROR",
  "CONSENSUS_FAILURE",
  "EXECUTION_ERROR",
  "STATE_MISMATCH",
] as const;

export type TxStage = (typeof txStages)[number];
export type TxFailure = (typeof txFailures)[number];

