import { STU_DIONET_EXPLORER } from "./network";

export function explorerTx(hash: string) {
  return `${STU_DIONET_EXPLORER}/transactions/${hash}`;
}

export function explorerAddress(address: string) {
  return `${STU_DIONET_EXPLORER}/address/${address}`;
}

