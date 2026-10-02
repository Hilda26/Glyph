import { describe, expect, it } from "vitest";

type Finding = { field: string; status: "CORRECT" | "INCORRECT" | "UNCLEAR" };
type Review = {
  result: "ACCEPT" | "REJECT" | "INCONCLUSIVE" | "UNAVAILABLE";
  source_match: "MATCH" | "MISMATCH" | "UNCLEAR";
  completeness: "COMPLETE" | "MINOR_OMISSIONS" | "MAJOR_OMISSIONS" | "UNCLEAR";
  accuracy: "ACCURATE" | "MINOR_ERRORS" | "MATERIAL_ERRORS" | "UNCLEAR";
  field_findings: Finding[];
};

function coversConfiguredFields(findings: Finding[], labels: string[]) {
  return findings.length === labels.length && findings.every((finding, index) => finding.field === labels[index]);
}

function mapPolicy(review: Review, schemaMode: "PLAIN_TEXT" | "KEY_VALUE", labels: string[], acceptMinorErrors: boolean) {
  if (review.source_match === "MISMATCH") return "REJECT";
  if (review.result === "UNAVAILABLE") return "UNAVAILABLE";
  if (review.result === "REJECT") return "REJECT";
  if (review.result === "INCONCLUSIVE") return "INCONCLUSIVE";
  if (review.accuracy === "MATERIAL_ERRORS" || review.completeness === "MAJOR_OMISSIONS") return "REJECT";
  if (review.accuracy === "UNCLEAR" || review.completeness === "UNCLEAR" || review.source_match !== "MATCH") return "INCONCLUSIVE";
  if (schemaMode === "KEY_VALUE") {
    if (!coversConfiguredFields(review.field_findings, labels)) return "INCONCLUSIVE";
    if (review.field_findings.some((finding) => finding.status === "INCORRECT")) return "REJECT";
    if (review.field_findings.some((finding) => finding.status === "UNCLEAR")) return "INCONCLUSIVE";
  }
  if (review.result !== "ACCEPT") return "INCONCLUSIVE";
  const minorOk = review.accuracy === "ACCURATE" || (acceptMinorErrors && review.accuracy === "MINOR_ERRORS");
  const completeOk = review.completeness === "COMPLETE" || review.completeness === "MINOR_OMISSIONS";
  return minorOk && completeOk ? "ACCEPT" : "INCONCLUSIVE";
}

const acceptedBase: Review = {
  result: "ACCEPT",
  source_match: "MATCH",
  completeness: "COMPLETE",
  accuracy: "ACCURATE",
  field_findings: [
    { field: "date", status: "CORRECT" },
    { field: "item", status: "CORRECT" },
  ],
};

describe("review policy behavior", () => {
  it("requires every configured KEY_VALUE field exactly once before accepting", () => {
    expect(mapPolicy(acceptedBase, "KEY_VALUE", ["date", "item"], false)).toBe("ACCEPT");
    expect(mapPolicy({ ...acceptedBase, field_findings: [{ field: "date", status: "CORRECT" }] }, "KEY_VALUE", ["date", "item"], false)).toBe("INCONCLUSIVE");
    expect(mapPolicy({ ...acceptedBase, field_findings: [
      { field: "date", status: "CORRECT" },
      { field: "date", status: "CORRECT" },
    ] }, "KEY_VALUE", ["date", "item"], false)).toBe("INCONCLUSIVE");
  });

  it("does not turn explicit rejection or inconclusive consensus into acceptance", () => {
    expect(mapPolicy({ ...acceptedBase, result: "REJECT" }, "KEY_VALUE", ["date", "item"], true)).toBe("REJECT");
    expect(mapPolicy({ ...acceptedBase, result: "INCONCLUSIVE" }, "KEY_VALUE", ["date", "item"], true)).toBe("INCONCLUSIVE");
  });

  it("keeps minor-error acceptance gated by the bounty policy", () => {
    const minor = { ...acceptedBase, accuracy: "MINOR_ERRORS" } satisfies Review;
    expect(mapPolicy(minor, "KEY_VALUE", ["date", "item"], true)).toBe("ACCEPT");
    expect(mapPolicy(minor, "KEY_VALUE", ["date", "item"], false)).toBe("INCONCLUSIVE");
  });

  it("routes source-unavailable outcomes to recovery instead of acceptance", () => {
    expect(mapPolicy({ ...acceptedBase, result: "UNAVAILABLE" }, "PLAIN_TEXT", [], true)).toBe("UNAVAILABLE");
    expect(mapPolicy({ ...acceptedBase, source_match: "MISMATCH" }, "PLAIN_TEXT", [], true)).toBe("REJECT");
  });
});
