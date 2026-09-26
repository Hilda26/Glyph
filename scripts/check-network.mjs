import { readFileSync } from "node:fs";

const network = readFileSync("lib/genlayer/network.ts", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

if (!network.includes("61999")) {
  throw new Error("Studionet chain id 61999 is missing from shared network definition.");
}
if (!network.includes("https://studio.genlayer.com/api")) {
  throw new Error("Studionet RPC is missing from shared network definition.");
}
if (network.includes("61997") || network.includes("studio-dev") || network.includes("localnet")) {
  throw new Error("Forbidden non-canonical network found in production network config.");
}
if (pkg.dependencies["genlayer-js"] !== "1.1.8") {
  throw new Error("genlayer-js must be pinned exactly to 1.1.8.");
}
console.log("Studionet production configuration verified.");

