import { BountyList } from "@/components/bounty-list";
import { DeploymentBanner } from "@/components/deployment-banner";
import { readOpenBounties } from "@/lib/contract/adapters";
import { hasDeployedContracts } from "@/lib/contract/addresses";
import { fixtureBounties } from "@/lib/demo/fixtures";

export default async function TasksPage() {
  let bounties = fixtureBounties;
  let live = false;
  if (hasDeployedContracts()) {
    try {
      const liveBounties = await readOpenBounties();
      if (liveBounties.length > 0) {
        bounties = liveBounties;
        live = true;
      }
    } catch {
      live = false;
    }
  }
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <DeploymentBanner />
      <div className="mb-8">
        <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">{live ? "Live Studionet folios" : "Fixture folios"}</p>
        <h1 className="display text-5xl font-semibold">Archival transcription bounties</h1>
      </div>
      <BountyList bounties={bounties} />
    </main>
  );
}
