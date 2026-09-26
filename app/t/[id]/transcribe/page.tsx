import { notFound } from "next/navigation";
import { SourceViewer } from "@/components/source-viewer";
import { TranscriptionForm } from "@/components/transcription-form";
import { readBounty } from "@/lib/contract/adapters";
import { hasDeployedContracts } from "@/lib/contract/addresses";
import { fixtureBounties, fixtures } from "@/lib/demo/fixtures";

export default async function TranscribePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = Number(id) - 1;
  let bounty = fixtureBounties[index];
  let sourceImage = fixtures[index]?.image;
  if (hasDeployedContracts()) {
    try {
      bounty = await readBounty(id);
      sourceImage = bounty.sourceUrl;
    } catch {
      // Fixtures remain a local preview fallback when live reads are unavailable.
    }
  }
  if (!bounty || !sourceImage) notFound();
  return (
    <main className="grid min-h-screen gap-5 px-4 py-6 xl:grid-cols-[1.15fr_0.85fr]">
      <SourceViewer src={sourceImage} label={bounty.sourceLabel} />
      <aside className="rounded border border-[#191714]/25 bg-[#EFE4CF] p-4">
        <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">{bounty.schemaMode}</p>
        <h1 className="display text-4xl font-semibold">{bounty.title}</h1>
        <TranscriptionForm bounty={bounty} />
      </aside>
    </main>
  );
}
