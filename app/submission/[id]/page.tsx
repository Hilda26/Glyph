import Link from "next/link";
import { notFound } from "next/navigation";
import { readSubmission } from "@/lib/contract/adapters";
import { hasDeployedContracts } from "@/lib/contract/addresses";
import { fixtureReceipts } from "@/lib/demo/fixtures";

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let receipt = fixtureReceipts.find((item) => item.id === id);
  let live = false;
  if (hasDeployedContracts()) {
    try {
      receipt = await readSubmission(id);
      live = true;
    } catch {
      live = false;
    }
  }
  if (!receipt) notFound();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">{live ? "Live comparison receipt" : "Fixture comparison receipt"}</p>
      <h1 className="display text-5xl font-semibold">Submission {receipt.id}</h1>
      <div className="mt-8 grid gap-4 rounded border border-[#191714]/25 bg-[#F8F0DF] p-5">
        <p className="text-2xl font-black">{receipt.result}</p>
        <p>{receipt.reason}</p>
        <pre className="overflow-auto rounded bg-[#191714] p-4 text-[#EFE4CF]">{receipt.transcript}</pre>
        <p className="mono text-sm">Source {receipt.sourceMatch} / completeness {receipt.completeness} / accuracy {receipt.accuracy}</p>
        <p className="font-bold">
          {receipt.paid ? "Vault payout finalized" : receipt.refunded ? "Vault refund finalized" : "No Vault settlement released"}
        </p>
      </div>
      <Link href={`/t/${receipt.bountyId}`} className="mt-6 inline-block font-bold text-[#315B9A]">Return to folio</Link>
    </main>
  );
}
