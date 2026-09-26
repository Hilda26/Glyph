import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const files = ["contracts/glyphwork_tasks.py", "contracts/glyphwork_vault.py"];
const required = '# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }';

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const first = source.split(/\r?\n/, 1)[0];
  if (first !== required) throw new Error(`${file} does not pin the stable Studionet GenVM runtime.`);
  if (source.includes("py-genlayer:test")) throw new Error(`${file} uses test runtime.`);
  if (source.includes("61997") || source.includes("localnet")) throw new Error(`${file} references a forbidden network.`);
  if (source.includes("float(")) throw new Error(`${file} uses float arithmetic.`);
  if (source.includes("private") || source.includes("mnemonic")) throw new Error(`${file} contains signer language.`);
  if (source.includes("run_nondet_unsafe(") && !source.includes("validator_fn")) throw new Error(`${file} has nondet without validator.`);
  console.log(`${file} bytes=${Buffer.byteLength(source)} sha256=${createHash("sha256").update(source).digest("hex")}`);
}

