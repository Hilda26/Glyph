"use client";

import { AlertTriangle } from "lucide-react";
import { STU_DIONET_CHAIN_ID } from "@/lib/genlayer/network";
import { useWallet } from "./wallet-provider";

export function NetworkGuard() {
  const { account, chainId, switchToStudionet } = useWallet();
  if (!account || chainId === undefined || chainId === STU_DIONET_CHAIN_ID) return null;
  return (
    <div className="border-t border-[#B94B45]/40 bg-[#B94B45] px-4 py-2 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm font-semibold">
        <span className="inline-flex items-center gap-2"><AlertTriangle size={16} aria-hidden /> Wrong network. Glyphwork writes only to GenLayer Studionet 61999.</span>
        <button className="rounded bg-white px-3 py-1.5 text-[#191714]" onClick={switchToStudionet}>Switch to Studionet</button>
      </div>
    </div>
  );
}

