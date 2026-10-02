# Deployment

Glyphwork deployment is Studionet-only.

## Preconditions

- Funded wallet on GenLayer Studionet.
- Wallet connected to chain ID `61999`.
- RPC `https://studio.genlayer.com/api`.
- Reviewed contract source from this repository.

## Evidence to Record

Do not invent any of this. Record only after real deployment:

- Git SHA;
- source byte count;
- source SHA-256 for both contracts;
- public signer address;
- Tasks contract address;
- Vault contract address;
- deployment transaction hashes;
- final transaction status;
- execution result;
- `set_vault_once` transaction;
- sample create/fund/open/submit/evaluate/payout or refund transactions;
- explorer links;
- authoritative readbacks from `get_bounty`, `get_submission`, and `conservation`.

## Commands

```bash
npm run contracts:compile
npm run contracts:preflight
npm run check:network
node scripts/deploy-studionet.mjs
```

Deploy with the repository script using a funded signer supplied through the environment:

```bash
$env:GLYPHWORK_DEPLOYER_PRIVATE_KEY="0x..."
node scripts/deploy-studionet.mjs
```

The script reads the key from process environment, deploys Tasks, deploys Vault with the Tasks address, binds the Vault once, and writes `docs/deployment-evidence/latest.json`. Do not commit private keys or `.env.local`.

## Current Deployment Status

Deployed to Studionet 61999.

- Signer: `0xd5Fbe8dbfFdac681FA50Ed8D082d70Ce43080B1C`
- Tasks: `0x2Eb674387e52c79A9Ee48ee2a01630c959c9630d`
- Vault: `0xd13622176dDA146d2c86DB10c8b2b29bDbEf7BF8`
- Tasks deploy tx: `0x00c0efb40d3e74b4fbb49a6a8c2d62e1499ab734394ac7711a00f5a635e9d61d`
- Vault deploy tx: `0xfdac73e1fc62bf607d210707e812d69dedb803f4bb3a05f9915f87ace83bd84c`
- Vault binding tx: `0x6a5feba13bfd610e6f5963f151d827e37c68b2136e66d7e7a7e857f4b6bcb44c`

Latest live demo readbacks:

- Bounty `1`: `ACCEPTED`
- Submission `1`: `ACCEPT`
- Source match: `MATCH`
- Accuracy: `ACCURATE`
- Vault settlement: `was_paid=true`, `was_refunded=false`
- `conservation()`: `[1000000000000000, 1000000000000000, 0, 0]`

Full deployment receipts are recorded in `docs/deployment-evidence/latest.json`. The funded create/fund/open/submit/evaluate lifecycle is recorded in `docs/deployment-evidence/live-demo.json`.

## Production Hosting

Deployed on Vercel.

- Project: `glyph`
- Production URL: `https://glyph-lake.vercel.app`
- Deployment URL: `https://glyph-4xringx3o-auras-projects-2f862c53.vercel.app`
- Deployment ID: `dpl_6vSFx1XxY7xRzMBh7iV2a6bLeaYf`

Persistent Vercel environment variables are configured for Production, Preview, and Development:

- `NEXT_PUBLIC_GLYPHWORK_TASKS_ADDRESS`
- `NEXT_PUBLIC_GLYPHWORK_VAULT_ADDRESS`
- `NEXT_PUBLIC_STUDIONET_RPC`
- `NEXT_PUBLIC_STUDIONET_CHAIN_ID`
