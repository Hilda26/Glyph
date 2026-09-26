import Link from "next/link";
import { readCompletedSubmissions } from "@/lib/contract/adapters";
import { hasDeployedContracts } from "@/lib/contract/addresses";
import { fixtureReceipts } from "@/lib/demo/fixtures";

export default async function ArchivePage() {
  let receipts = fixtureReceipts;
  let live = false;
  if (hasDeployedContracts()) {
    try {
      const liveReceipts = await readCompletedSubmissions();
      if (liveReceipts.length > 0) {
        receipts = liveReceipts;
        live = true;
      }
    } catch {
      live = false;
    }
  }
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">{live ? "Live completed records" : "Fixture completed records"}</p>
      <h1 className="display text-5xl font-semibold">Public archive</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {receipts.map((receipt) => (
          <Link href={`/submission/${receipt.id}`} key={receipt.id} className="rounded border border-[#191714]/25 bg-[#F8F0DF] p-5">
            <p className="mono text-xs uppercase tracking-widest">{receipt.result}</p>
            <h2 className="display text-3xl font-semibold">Bounty {receipt.bountyId}</h2>
            <p className="mt-2">{receipt.reason}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
