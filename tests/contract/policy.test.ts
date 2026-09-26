import { describe, expect, it } from "vitest";
import { parseGenToWei, formatWeiToGen } from "@/lib/validation/gen";
import { canonicalizeSourceUrl, normalizeFieldLabels } from "@/lib/validation/source";
import { STU_DIONET_CHAIN_ID, STU_DIONET_RPC } from "@/lib/genlayer/network";
import pkg from "@/package.json" assert { type: "json" };

describe("Studionet and accounting invariants", () => {
  it("pins the canonical Studionet network", () => {
    expect(STU_DIONET_CHAIN_ID).toBe(61999);
    expect(STU_DIONET_RPC).toBe("https://studio.genlayer.com/api");
    expect(pkg.dependencies["genlayer-js"]).toBe("1.1.8");
  });

  it("parses GEN without floating point", () => {
    expect(parseGenToWei("1.25")).toBe(1_250_000_000_000_000_000n);
    expect(formatWeiToGen(1_250_000_000_000_000_000n)).toBe("1.25");
    expect(() => parseGenToWei("0.0000000000000000001")).toThrow();
  });

  it("hardens source URLs and field labels", () => {
    expect(canonicalizeSourceUrl("https://Archive.Example.org/path#frag")).toBe("https://archive.example.org/path");
    expect(() => canonicalizeSourceUrl("http://archive.example.org")).toThrow();
    expect(() => canonicalizeSourceUrl("https://localhost/image.png")).toThrow();
    expect(normalizeFieldLabels(["Date", " date ", "Item"])).toEqual(["date", "item"]);
  });
});

