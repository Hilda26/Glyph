import Link from "next/link";
import { HeroLoupe } from "@/components/hero-loupe";
import { FixtureStrip } from "@/components/fixture-strip";
import { TxLifecycleRail } from "@/components/tx-lifecycle-rail";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-[#191714]/20">
        <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <p className="mono mb-5 inline-block border border-[#191714]/30 px-3 py-1 text-xs uppercase tracking-widest">
              Studionet 61999 archival desk
            </p>
            <h1 className="display text-5xl font-semibold leading-[0.95] sm:text-7xl lg:text-8xl">
              TURN PUBLIC ARCHIVES INTO VERIFIED TEXT.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8">
              Sponsors fund fixed GEN rewards for public-domain source folios. Workers transcribe them.
              GenLayer validators independently inspect the immutable image before the vault releases payment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tasks" className="rounded bg-[#191714] px-5 py-3 font-bold text-[#efe4cf]">
                Open folios
              </Link>
              <Link href="/new" className="rounded border border-[#191714] px-5 py-3 font-bold">
                Sponsor a folio
              </Link>
            </div>
          </div>
          <HeroLoupe />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">Demo source set</p>
            <h2 className="display text-4xl font-semibold">Original public-domain-style fixtures</h2>
          </div>
          <Link href="/tasks" className="font-bold text-[#315B9A]">View folios</Link>
        </div>
        <FixtureStrip />
      </section>
      <section className="border-y border-[#191714]/20 bg-[#191714] text-[#efe4cf]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mono text-xs uppercase tracking-widest text-[#AD8A50]">Consensus to custody</p>
            <h2 className="display mt-3 text-4xl font-semibold">A hash-locked folio, a sealed policy, and no sponsor veto after acceptance.</h2>
          </div>
          <TxLifecycleRail />
        </div>
      </section>
    </main>
  );
}

