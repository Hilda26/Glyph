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
- Tasks: `0x0fcbeFD1D4e0B36f57E8F9B0d143F3FFc1c5D593`
- Vault: `0xaF0B724b2a990Fc4E2C5D57db21Aea2b3Fb71507`
- Tasks deploy tx: `0x99d7c1bda1fb011556d1fcd0e3b19e4bf4c2b79c2b3b88a6ffdf3de7d3105b44`
- Vault deploy tx: `0x5fccde3cd1f60099674629998f70a1e9bafdf0a68d2c2fcc08b5895a4a9e898e`
- Vault binding tx: `0x0c66363f08e2b5be3eed01492dbf4dcef720f9063e32e86635488074ad076b63`

Initial readbacks:

- `get_bounty_count()`: `0`
- `get_submission_count()`: `0`
- `conservation()`: `[0, 0, 0, 0]`

Full deployment receipts and schemas are recorded in `docs/deployment-evidence/latest.json`.
