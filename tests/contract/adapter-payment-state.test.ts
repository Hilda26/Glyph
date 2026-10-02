import { beforeEach, describe, expect, it, vi } from "vitest";

const readContract = vi.fn();

vi.mock("genlayer-js", () => ({
  createClient: () => ({ readContract }),
}));

vi.mock("@/lib/genlayer/network", () => ({
  glyphworkNetwork: { id: 61999, name: "Studionet", rpcUrls: { default: { http: ["https://studio.genlayer.com/api"] } } },
}));

describe("receipt Vault settlement adapter", () => {
  beforeEach(() => {
    vi.resetModules();
    readContract.mockReset();
    process.env.NEXT_PUBLIC_GLYPHWORK_TASKS_ADDRESS = "0x0000000000000000000000000000000000000001";
    process.env.NEXT_PUBLIC_GLYPHWORK_VAULT_ADDRESS = "0x0000000000000000000000000000000000000002";
  });

  it("reads paid and refunded flags from Vault for receipts", async () => {
    readContract
      .mockResolvedValueOnce({
        id: "7",
        bounty_id: "4",
        worker: "0x0000000000000000000000000000000000000003",
        result: "ACCEPT",
        reason: "accepted by consensus",
        source_match: "MATCH",
        completeness: "COMPLETE",
        accuracy: "ACCURATE",
        transcription: "text",
      })
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const { readSubmission } = await import("@/lib/contract/adapters");
    const receipt = await readSubmission("7");

    expect(receipt.paid).toBe(true);
    expect(receipt.refunded).toBe(false);
    expect(readContract).toHaveBeenCalledWith(expect.objectContaining({ functionName: "was_paid", args: ["4"] }));
    expect(readContract).toHaveBeenCalledWith(expect.objectContaining({ functionName: "was_refunded", args: ["4"] }));
  });

  it("can show a Vault refund even when no payout was released", async () => {
    readContract
      .mockResolvedValueOnce({
        id: "8",
        bounty_id: "5",
        worker: "0x0000000000000000000000000000000000000004",
        result: "UNAVAILABLE",
        reason: "source could not be recovered",
        source_match: "UNCLEAR",
        completeness: "UNCLEAR",
        accuracy: "UNCLEAR",
        transcription: "text",
      })
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const { readSubmission } = await import("@/lib/contract/adapters");
    const receipt = await readSubmission("8");

    expect(receipt.paid).toBe(false);
    expect(receipt.refunded).toBe(true);
  });
});
