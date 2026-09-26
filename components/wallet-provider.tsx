"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STU_DIONET_CHAIN_ID, STU_DIONET_RPC } from "@/lib/genlayer/network";
import { getInjectedProvider, type Eip1193Provider } from "@/lib/wallet/eip1193";
import { normalizeWalletError } from "@/lib/wallet/errors";

type WalletState = {
  provider?: Eip1193Provider;
  account?: `0x${string}`;
  chainId?: number;
  error?: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToStudionet: () => Promise<void>;
};

const WalletContext = createContext<WalletState | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<Eip1193Provider | undefined>(() => getInjectedProvider());
  const [account, setAccount] = useState<`0x${string}` | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [error, setError] = useState<string | undefined>();

  const readChain = useCallback(async (activeProvider: Eip1193Provider) => {
    const raw = await activeProvider.request({ method: "eth_chainId" });
    setChainId(Number.parseInt(String(raw), 16));
  }, []);

  const connect = useCallback(async () => {
    const activeProvider = getInjectedProvider();
    if (!activeProvider) {
      setError("NO_WALLET");
      return;
    }
    setProvider(activeProvider);
    try {
      const accounts = (await activeProvider.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accounts[0] as `0x${string}` | undefined);
      await readChain(activeProvider);
      setError(undefined);
    } catch (caught) {
      setError(normalizeWalletError(caught));
    }
  }, [readChain]);

  const disconnect = useCallback(() => {
    setAccount(undefined);
    setError(undefined);
  }, []);

  const switchToStudionet = useCallback(async () => {
    const activeProvider = provider ?? getInjectedProvider();
    if (!activeProvider) {
      setError("NO_WALLET");
      return;
    }
    try {
      await activeProvider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${STU_DIONET_CHAIN_ID.toString(16)}`,
            chainName: "GenLayer Studionet",
            nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
            rpcUrls: [STU_DIONET_RPC],
            blockExplorerUrls: ["https://explorer-studio.genlayer.com"],
          },
        ],
      });
      await activeProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${STU_DIONET_CHAIN_ID.toString(16)}` }],
      });
      setProvider(activeProvider);
      await readChain(activeProvider);
      setError(undefined);
    } catch (caught) {
      setError(normalizeWalletError(caught));
    }
  }, [provider, readChain]);

  useEffect(() => {
    const activeProvider = getInjectedProvider();
    if (!activeProvider?.on) return;
    const onAccounts = (...args: unknown[]) => {
      const accounts = (args[0] as string[]) ?? [];
      setAccount(accounts[0] as `0x${string}` | undefined);
    };
    const onChain = (...args: unknown[]) => setChainId(Number.parseInt(String(args[0]), 16));
    const onDisconnect = () => {
      setAccount(undefined);
      setError("PROVIDER_DISCONNECTED");
    };
    activeProvider.on("accountsChanged", onAccounts);
    activeProvider.on("chainChanged", onChain);
    activeProvider.on("disconnect", onDisconnect);
    const timer = window.setTimeout(() => {
      void readChain(activeProvider).catch(() => undefined);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      activeProvider.removeListener?.("accountsChanged", onAccounts);
      activeProvider.removeListener?.("chainChanged", onChain);
      activeProvider.removeListener?.("disconnect", onDisconnect);
    };
  }, [readChain]);

  const value = useMemo(
    () => ({ provider, account, chainId, error, connect, disconnect, switchToStudionet }),
    [provider, account, chainId, error, connect, disconnect, switchToStudionet],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error("useWallet must be used inside WalletProvider");
  return wallet;
}
