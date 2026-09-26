export function normalizeWalletError(error: unknown): string {
  const maybe = error as { code?: number; message?: string };
  if (maybe?.code === 4001) return "USER_REJECTED";
  if (maybe?.code === 4900) return "PROVIDER_DISCONNECTED";
  if (maybe?.code === 4902) return "WRONG_NETWORK";
  return maybe?.message ?? "RPC_ERROR";
}

