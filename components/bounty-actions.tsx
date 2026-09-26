"use client";

import { useState } from "react";
import { Coins, FileCheck, RotateCw, Undo2 } from "lucide-react";
import type { CalldataEncodable } from "genlayer-js/types";
import type { BountySummary } from "@/lib/contract/types";
import { contractAddresses, hasDeployedContracts } from "@/lib/contract/addresses";
import { explorerTx } from "@/lib/genlayer/explorer";
import { writeAndConfirm } from "@/lib/contract/adapters";
import { useWallet } from "./wallet-provider";

export function BountyActions({ bounty }: { bounty: BountySummary }) {
  const wallet = useWallet();
  const [stage, setStage] = useState<string>();
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();

  async function run(address: string, functionName: string, args: CalldataEncodable[], value?: bigint) {
    setError(undefined);
    if (!wallet.account || !wallet.provider) {
      await wallet.connect();
      return;
    }
    try {
      const result = await writeAndConfirm({
        provider: wallet.provider,
        account: wallet.account,
        address,
        functionName,
        args,
        value,
        onStage(next, detail) {
          setStage(next);
          if (detail) setTxHash(detail);
        },
      });
      setTxHash(result.hash);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "RPC_ERROR");
    }
  }

  if (!hasDeployedContracts()) {
    return null;
  }

  return (
    <div className="mt-6 grid gap-3 rounded border border-[#191714]/25 bg-[#F8F0DF] p-4">
      <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">On-chain actions</p>
      <div className="flex flex-wrap gap-2">
        {bounty.status === "DRAFT" && (
          <button className="inline-flex items-center gap-2 rounded bg-[#191714] px-3 py-2 text-sm font-bold text-[#EFE4CF]" onClick={() => run(contractAddresses.vault, "fund_bounty", [bounty.id], bounty.rewardWei)}>
            <Coins size={16} /> Fund exact reward
          </button>
        )}
        {bounty.status === "FUNDED" && (
          <button className="inline-flex items-center gap-2 rounded bg-[#315B9A] px-3 py-2 text-sm font-bold text-white" onClick={() => run(contractAddresses.tasks, "verify_source_and_open", [bounty.id])}>
            <FileCheck size={16} /> Verify source and open
          </button>
        )}
        {bounty.status === "SUBMITTED" && (
          <button className="inline-flex items-center gap-2 rounded bg-[#315B9A] px-3 py-2 text-sm font-bold text-white" onClick={() => run(contractAddresses.tasks, "evaluate_active_submission", [bounty.id])}>
            <RotateCw size={16} /> Evaluate submission
          </button>
        )}
        {["OPEN", "REJECTED", "EXPIRED"].includes(bounty.status) && (
          <button className="inline-flex items-center gap-2 rounded border border-[#191714]/40 px-3 py-2 text-sm font-bold" onClick={() => run(contractAddresses.tasks, "expire_and_refund", [bounty.id])}>
            <Undo2 size={16} /> Expire/refund if eligible
          </button>
        )}
      </div>
      {stage && <p className="mono text-xs">Lifecycle: {stage}</p>}
      {txHash && <a className="text-sm font-bold text-[#315B9A]" href={explorerTx(txHash)} target="_blank" rel="noreferrer">Open latest transaction</a>}
      {error && <p className="rounded bg-[#B94B45] p-3 text-sm text-white">{error}</p>}
    </div>
  );
}

