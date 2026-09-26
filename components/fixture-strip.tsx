import Link from "next/link";
import { fixtures } from "@/lib/demo/fixtures";

export function FixtureStrip() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {fixtures.map((fixture, index) => (
        <Link key={fixture.id} href={`/t/${index + 1}`} className="group rounded border border-[#191714]/25 bg-[#F8F0DF] p-3 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(49,91,154,0.2)]">
          <div className="relative aspect-[4/3] overflow-hidden border border-[#191714]/15 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fixture.image} alt="" className="h-full w-full object-cover" />
          </div>
          <p className="mono mt-3 text-xs uppercase tracking-widest text-[#72806A]">{fixture.difficulty}</p>
          <h3 className="display text-2xl font-semibold">{fixture.title}</h3>
          <p className="text-sm">{fixture.label}</p>
        </Link>
      ))}
    </div>
  );
}
