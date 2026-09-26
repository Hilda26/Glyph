const WEI_PER_GEN = 10n ** 18n;

export function parseGenToWei(input: string): bigint {
  const value = input.trim();
  if (!/^\d+(\.\d{0,18})?$/.test(value)) {
    throw new Error("Enter a GEN amount with up to 18 decimals.");
  }
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * WEI_PER_GEN + BigInt((fraction + "0".repeat(18)).slice(0, 18));
}

export function formatWeiToGen(value: bigint): string {
  const whole = value / WEI_PER_GEN;
  const fraction = (value % WEI_PER_GEN).toString().padStart(18, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

