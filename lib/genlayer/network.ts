import { studionet } from "genlayer-js/chains";

export const STU_DIONET_CHAIN_ID = 61999;
export const STU_DIONET_RPC = "https://studio.genlayer.com/api";
export const STU_DIONET_EXPLORER = "https://explorer-studio.genlayer.com";
export const STU_DIONET_CURRENCY = "GEN";

export const glyphworkNetwork = {
  ...studionet,
  id: STU_DIONET_CHAIN_ID,
  rpcUrls: {
    default: { http: [STU_DIONET_RPC] },
    public: { http: [STU_DIONET_RPC] },
  },
  nativeCurrency: {
    name: STU_DIONET_CURRENCY,
    symbol: STU_DIONET_CURRENCY,
    decimals: 18,
  },
} as const;

export function assertProductionNetwork() {
  const chainId = Number(process.env.NEXT_PUBLIC_STUDIONET_CHAIN_ID ?? STU_DIONET_CHAIN_ID);
  const rpc = process.env.NEXT_PUBLIC_STUDIONET_RPC ?? STU_DIONET_RPC;
  if (chainId !== STU_DIONET_CHAIN_ID || rpc !== STU_DIONET_RPC) {
    throw new Error(`Glyphwork production network must be Studionet 61999 at ${STU_DIONET_RPC}`);
  }
}

