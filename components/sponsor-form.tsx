"use client";

import { useState } from "react";
import { FilePlus } from "lucide-react";
import { canonicalizeSourceUrl, normalizeFieldLabels } from "@/lib/validation/source";
import { parseGenToWei } from "@/lib/validation/gen";
import { contractAddresses, hasDeployedContracts } from "@/lib/contract/addresses";
import { writeAndConfirm } from "@/lib/contract/adapters";
import { useWallet } from "./wallet-provider";
import type { CalldataEncodable } from "genlayer-js/types";

export function SponsorForm() {
  const wallet = useWallet();
  const [mode, setMode] = useState<"PLAIN_TEXT" | "KEY_VALUE">("PLAIN_TEXT");
  const [fields, setFields] = useState("date\nlocation\nitem\nquantity\nnote");
  const [stage, setStage] = useState<string>();
  const [error, setError] = useState<string>();

  async function submit(formData: FormData) {
    setError(undefined);
    if (!wallet.account || !wallet.provider) {
      await wallet.connect();
      return;
    }
    try {
      const sourceUrl = canonicalizeSourceUrl(String(formData.get("sourceUrl")));
      const rewardWei = parseGenToWei(String(formData.get("reward")));
      const labels = mode === "KEY_VALUE" ? normalizeFieldLabels(fields.split(/\r?\n|,/)) : [];
      await writeAndConfirm({
        provider: wallet.provider,
        account: wallet.account,
        address: contractAddresses.tasks,
        functionName: "create_draft",
        args: [
          String(formData.get("title")),
          String(formData.get("sourceLabel")),
          sourceUrl,
          String(formData.get("expectedHash")).toLowerCase(),
          mode,
          labels,
          String(formData.get("rules")),
          rewardWei.toString(),
          Number(formData.get("deadline")),
          Number(formData.get("maxAttempts")),
          Boolean(formData.get("acceptMinorErrors")),
        ] as CalldataEncodable[],
        onStage: setStage,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "RPC_ERROR");
    }
  }

  return (
    <form action={submit} className="mt-8 grid gap-5 rounded border border-[#191714]/25 bg-[#F8F0DF] p-5">
      <label className="grid gap-1">Title<input required name="title" className="rounded border border-[#191714]/30 bg-white px-3 py-2" /></label>
      <label className="grid gap-1">Archive/source label<input required name="sourceLabel" className="rounded border border-[#191714]/30 bg-white px-3 py-2" /></label>
      <label className="grid gap-1">HTTPS source image URL<input required name="sourceUrl" type="url" className="rounded border border-[#191714]/30 bg-white px-3 py-2" /></label>
      <label className="grid gap-1">Expected source SHA-256<input required name="expectedHash" pattern="[a-fA-F0-9]{64}" className="mono rounded border border-[#191714]/30 bg-white px-3 py-2" /></label>
      <div className="flex gap-2" role="radiogroup" aria-label="Schema mode">
        {(["PLAIN_TEXT", "KEY_VALUE"] as const).map((choice) => (
          <button type="button" key={choice} onClick={() => setMode(choice)} className={`rounded border px-3 py-2 font-bold ${mode === choice ? "bg-[#315B9A] text-white" : "bg-white"}`}>{choice}</button>
        ))}
      </div>
      {mode === "KEY_VALUE" && <label className="grid gap-1">Field labels<textarea value={fields} onChange={(event) => setFields(event.target.value)} className="mono min-h-28 rounded border border-[#191714]/30 bg-white px-3 py-2" /></label>}
      <label className="grid gap-1">Transcription rules<textarea required name="rules" className="min-h-28 rounded border border-[#191714]/30 bg-white px-3 py-2" /></label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1">Reward GEN<input required name="reward" inputMode="decimal" className="rounded border border-[#191714]/30 bg-white px-3 py-2" /></label>
        <label className="grid gap-1">Deadline Unix<input required name="deadline" type="number" className="rounded border border-[#191714]/30 bg-white px-3 py-2" /></label>
        <label className="grid gap-1">Max attempts<input required name="maxAttempts" type="number" min={1} max={8} defaultValue={3} className="rounded border border-[#191714]/30 bg-white px-3 py-2" /></label>
      </div>
      <label className="inline-flex items-center gap-2"><input type="checkbox" name="acceptMinorErrors" defaultChecked /> Accept minor errors</label>
      <button className="inline-flex items-center justify-center gap-2 rounded bg-[#191714] px-5 py-3 font-bold text-[#EFE4CF] disabled:opacity-50" disabled={!hasDeployedContracts()}>
        <FilePlus size={18} /> Create draft on Tasks contract
      </button>
      {!hasDeployedContracts() && <p className="text-sm">Configure deployed Studionet contract addresses before sponsoring.</p>}
      {stage && <p className="mono text-sm">{stage}</p>}
      {error && <p className="rounded bg-[#B94B45] p-3 text-white">{error}</p>}
    </form>
  );
}
