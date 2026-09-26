import { SponsorForm } from "@/components/sponsor-form";

export default function NewBountyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">Sponsor desk</p>
      <h1 className="display text-5xl font-semibold">Sponsor a public folio</h1>
      <SponsorForm />
    </main>
  );
}

