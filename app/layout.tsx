import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { WalletProvider } from "@/components/wallet-provider";
import { WalletButton } from "@/components/wallet-button";
import { NetworkGuard } from "@/components/network-guard";

export const metadata: Metadata = {
  title: "Glyphwork",
  description: "Verified public-domain archival transcription bounties on GenLayer Studionet.",
};

const nav = [
  ["Folios", "/tasks"],
  ["Sponsor", "/new"],
  ["Archive", "/archive"],
  ["My Desk", "/me"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <header className="sticky top-0 z-40 border-b border-[#191714]/20 bg-[#efe4cf]/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="display text-2xl font-semibold" aria-label="Glyphwork home">
                Glyphwork
              </Link>
              <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
                {nav.map(([label, href]) => (
                  <Link key={href} href={href} className="rounded px-3 py-2 text-sm font-semibold hover:bg-[#191714]/10">
                    {label}
                  </Link>
                ))}
              </nav>
              <WalletButton />
            </div>
            <NetworkGuard />
          </header>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}

