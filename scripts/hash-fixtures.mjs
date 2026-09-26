import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const files = [
  "public/fixtures/typed-notice.png",
  "public/fixtures/typed-notice.svg",
  "public/fixtures/handwritten-ledger.svg",
  "public/fixtures/ambiguous-card.svg",
];

for (const file of files) {
  const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
  console.log(`${file} ${hash}`);
}
