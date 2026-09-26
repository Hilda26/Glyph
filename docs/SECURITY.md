# Security

## Network and Signers

The app is pinned to Studionet 61999. The production network check rejects chain `61997`, localnet, Studio-dev naming, and any RPC other than `https://studio.genlayer.com/api`.

The browser signs writes with the user's injected EIP-1193 provider. This repo ships no private keys, mnemonics, generated funded browser wallet, server signer, or deployment secret.

## Source URL Hardening

Frontend validation and contract validation require:

- HTTPS;
- bounded length;
- no embedded credentials;
- no localhost or common private IP ranges;
- canonical host casing;
- bounded source image bytes.

The contract source hash check is the authority. CSS brightness, contrast, zoom, and rotation in the workbench never modify source bytes used by consensus.

## Custody

Vault tracks credited GEN deposits explicitly and accepts only the exact reward amount defined by Tasks. Payout and refund update storage before emitting value transfer messages. Each bounty deposit can be paid or refunded once.

The LLM never chooses a raw amount or beneficiary. Vault re-reads Tasks state and validates the accepted worker and reward before transfer.

## Remaining External Risk

Live Studionet deployment and transaction evidence require a funded signer outside this repository. Until deployed addresses are configured, the UI labels fixture records as previews and disables writes.

