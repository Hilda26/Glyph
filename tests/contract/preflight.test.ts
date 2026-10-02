import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const contractFiles = ["contracts/glyphwork_tasks.py", "contracts/glyphwork_vault.py"];

describe("contract source preflight", () => {
  it("uses stable runtime and independent nondet validators", () => {
    for (const file of contractFiles) {
      const source = readFileSync(file, "utf8");
      expect(source.split(/\r?\n/, 1)[0]).toContain("py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6");
      expect(source).not.toContain("py-genlayer:test");
      expect(source).not.toContain("61997");
      expect(source).not.toContain("float(");
      expect(createHash("sha256").update(source).digest("hex")).toMatch(/^[a-f0-9]{64}$/);
    }
    const tasks = readFileSync("contracts/glyphwork_tasks.py", "utf8");
    expect(tasks).toContain("gl.vm.run_nondet_unsafe(leader_fn, validator_fn)");
    expect(tasks).toContain("images=[image]");
    expect(tasks).toContain("candidate[\"field_findings\"] == expected[\"field_findings\"]");
    expect(tasks).toContain("refund_unavailable(bounty_id)");
    expect(tasks).toContain("_covers_configured_fields(review[\"field_findings\"], labels)");
  });
});
