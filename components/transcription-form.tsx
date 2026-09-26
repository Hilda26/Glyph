"use client";

import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import type { BountySummary } from "@/lib/contract/types";
import { contractAddresses, hasDeployedContracts } from "@/lib/contract/addresses";
import { writeAndConfirm } from "@/lib/contract/adapters";
import { useWallet } from "./wallet-provider";
import { explorerTx } from "@/lib/genlayer/explorer";
import type { CalldataEncodable } from "genlayer-js/types";

export function TranscriptionForm({ bounty }: { bounty: BountySummary }) {
  const { account, provider, chainId, connect } = useWallet();
  const draftKey = `glyphwork:${bounty.id}:draft`;
  const [text, setText] = useState(() => (typeof window === "undefined" ? "" : localStorage.getItem(draftKey) ?? ""));
  const [uncertain, setUncertain] = useState(false);
  const [note, setNote] = useState("");
  const [stage, setStage] = useState<string>();
  const [txHash, setTxHash] = useState<string>();
  const canSubmit = hasDeployedContracts() && account && provider && chainId === 61999;

  useEffect(() => {
    localStorage.setItem(draftKey, text);
  }, [draftKey, text]);

  const placeholder = useMemo(() => bounty.schemaMode === "KEY_VALUE"
    ? `{\n${bounty.fieldLabels.map((field) => `  "${field}": ""`).join(",\n")}\n}`
    : "Line-preserving transcription", [bounty.fieldLabels, bounty.schemaMode]);

  async function submit() {
    if (!account || !provider) {
      await connect();
      return;
    }
    await writeAndConfirm({
      provider,
      account,
      address: contractAddresses.tasks,
      functionName: "submit_transcription",
      args: [bounty.id, text, uncertain, note] as CalldataEncodable[],
      onStage(nextStage, detail) {
        setStage(nextStage);
        if (detail) setTxHash(detail);
      },
    });
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="mono text-xs uppercase tracking-widest">Transcription</span>
        <textarea className="min-h-[360px] resize-y rounded border border-[#191714]/30 bg-[#F8F0DF] p-4 font-mono text-sm leading-7" value={text} onChange={(event) => setText(event.target.value)} placeholder={placeholder} />
      </label>
      <label className="inline-flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={uncertain} onChange={(event) => setUncertain(event.target.checked)} />
        Mark material uncertainty
      </label>
      <label className="grid gap-2">
        <span className="mono text-xs uppercase tracking-widest">Worker note</span>
        <input className="rounded border border-[#191714]/30 bg-[#F8F0DF] px-3 py-2" value={note} onChange={(event) => setNote(event.target.value)} maxLength={400} />
      </label>
      <button disabled={!text.trim()} onClick={submit} className="inline-flex items-center justify-center gap-2 rounded bg-[#191714] px-5 py-3 font-bold text-[#EFE4CF] disabled:cursor-not-allowed disabled:opacity-50">
        <Send size={18} /> {canSubmit ? "Submit to consensus" : "Connect Studionet wallet"}
      </button>
      {stage && <p className="mono text-sm">Lifecycle: {stage}</p>}
      {txHash && <a className="text-sm font-bold text-[#315B9A]" href={explorerTx(txHash)} target="_blank" rel="noreferrer">Open transaction</a>}
      {!hasDeployedContracts() && <p className="rounded border border-[#AD8A50]/50 p-3 text-sm">Deployment addresses are required before writes can be submitted. The local draft autosaves in this browser only.</p>}
    </div>
  );
}
