"use client";

import { PlugZap, Unplug } from "lucide-react";
import { useWallet } from "./wallet-provider";

export function WalletButton() {
  const { account, connect, disconnect, error } = useWallet();
  if (account) {
    return (
      <button className="inline-flex items-center gap-2 rounded bg-[#315B9A] px-3 py-2 text-sm font-bold text-white" onClick={disconnect} title="Disconnect wallet">
        <Unplug size={16} aria-hidden />
        {account.slice(0, 6)}...{account.slice(-4)}
      </button>
    );
  }
  return (
    <button className="inline-flex items-center gap-2 rounded bg-[#191714] px-3 py-2 text-sm font-bold text-[#EFE4CF]" onClick={connect} title={error ?? "Connect wallet"}>
      <PlugZap size={16} aria-hidden />
      Connect
    </button>
  );
}

