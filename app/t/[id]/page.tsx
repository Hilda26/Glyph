import Link from "next/link";
import { notFound } from "next/navigation";
import { BountyActions } from "@/components/bounty-actions";
import { readBounty } from "@/lib/contract/adapters";
import { hasDeployedContracts } from "@/lib/contract/addresses";
import { fixtureBounties, fixtures } from "@/lib/demo/fixtures";
import { formatWeiToGen } from "@/lib/validation/gen";

export default async function FolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = Number(id) - 1;
  let bounty = fixtureBounties[index];
  let sourceImage = fixtures[index]?.image;
  let live = false;
  if (hasDeployedContracts()) {
    try {
      bounty = await readBounty(id);
      sourceImage = bounty.sourceUrl;
      live = true;
    } catch {
      live = false;
    }
  }
  if (!bounty || !sourceImage) notFound();
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_0.8fr]">
      <div className="relative aspect-[4/3] overflow-hidden border border-[#191714]/25 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sourceImage} alt={bounty.sourceLabel} className="h-full w-full object-contain" />
      </div>
      <section>
        <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">{live ? "Live Studionet folio" : bounty.sourceLabel}</p>
        <h1 className="display text-5xl font-semibold">{bounty.title}</h1>
        <dl className="mt-6 grid gap-3 text-sm">
          <div><dt className="font-bold">Reward</dt><dd>{formatWeiToGen(bounty.rewardWei)} GEN</dd></div>
          <div><dt className="font-bold">Status</dt><dd>{bounty.status}</dd></div>
          <div><dt className="font-bold">Source SHA-256</dt><dd className="mono break-all">{bounty.expectedHash}</dd></div>
          <div><dt className="font-bold">Definition hash</dt><dd className="mono">{bounty.definitionHash}</dd></div>
          <div><dt className="font-bold">Transcription rules</dt><dd>{bounty.transcriptionRules}</dd></div>
          <div><dt className="font-bold">Minor-error policy</dt><dd>{bounty.acceptMinorErrors ? "Accepted" : "Not accepted"}</dd></div>
          {bounty.schemaMode === "KEY_VALUE" && <div><dt className="font-bold">Configured fields</dt><dd className="mono">{bounty.fieldLabels.join(", ")}</dd></div>}
        </dl>
        <BountyActions bounty={bounty} />
        <Link href={`/t/${id}/transcribe`} className="mt-8 inline-block rounded bg-[#191714] px-5 py-3 font-bold text-[#EFE4CF]">Open workbench</Link>
      </section>
    </main>
  );
}
