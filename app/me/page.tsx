import { readAllBounties, readAllSubmissions } from "@/lib/contract/adapters";
import { hasDeployedContracts } from "@/lib/contract/addresses";
import { fixtureBounties, fixtureReceipts } from "@/lib/demo/fixtures";

export default async function MePage() {
  let bounties = fixtureBounties;
  let receipts = fixtureReceipts;
  let live = false;
  if (hasDeployedContracts()) {
    try {
      const [liveBounties, liveReceipts] = await Promise.all([readAllBounties(), readAllSubmissions()]);
      if (liveBounties.length > 0 || liveReceipts.length > 0) {
        bounties = liveBounties;
        receipts = liveReceipts;
        live = true;
      }
    } catch {
      live = false;
    }
  }
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">{live ? "Live wallet desk" : "Fixture wallet desk"}</p>
      <h1 className="display text-5xl font-semibold">Submissions and sponsored folios</h1>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="rounded border border-[#191714]/25 bg-[#F8F0DF] p-5">
          <h2 className="display text-3xl font-semibold">Sponsored</h2>
          {bounties.map((bounty) => <p key={bounty.id} className="mt-3 border-t border-[#191714]/15 pt-3">{bounty.title} / {bounty.status}</p>)}
        </section>
        <section className="rounded border border-[#191714]/25 bg-[#F8F0DF] p-5">
          <h2 className="display text-3xl font-semibold">Submitted</h2>
          {receipts.map((receipt) => <p key={receipt.id} className="mt-3 border-t border-[#191714]/15 pt-3">Bounty {receipt.bountyId} / {receipt.result}</p>)}
        </section>
      </div>
    </main>
  );
}
