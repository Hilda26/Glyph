import { txStages } from "@/lib/transactions/lifecycle";

export function TxLifecycleRail() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {txStages.map((stage, index) => (
        <li key={stage} className="rounded border border-[#EFE4CF]/20 p-4">
          <span className="mono text-xs text-[#AD8A50]">{String(index + 1).padStart(2, "0")}</span>
          <p className="mt-2 font-bold">{stage.replaceAll("_", " ")}</p>
        </li>
      ))}
    </ol>
  );
}

