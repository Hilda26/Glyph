import Link from "next/link";
import type { BountySummary } from "@/lib/contract/types";
import { formatWeiToGen } from "@/lib/validation/gen";

export function BountyList({ bounties }: { bounties: BountySummary[] }) {
  return (
    <div className="grid gap-4">
      {bounties.map((bounty) => (
        <Link key={bounty.id} href={`/t/${bounty.id}`} className="grid gap-4 rounded border border-[#191714]/25 bg-[#F8F0DF] p-4 transition hover:shadow-[8px_8px_0_rgba(25,23,20,0.12)] md:grid-cols-[1fr_auto]">
          <div>
            <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">{bounty.sourceLabel}</p>
            <h2 className="display text-3xl font-semibold">{bounty.title}</h2>
            <p className="mt-2 text-sm">Status {bounty.status} / attempts {bounty.attempts} of {bounty.maxAttempts}</p>
          </div>
          <div className="md:text-right">
            <p className="mono text-xs uppercase tracking-widest text-[#72806A]">Reward</p>
            <p className="text-2xl font-black">{formatWeiToGen(bounty.rewardWei)} GEN</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

