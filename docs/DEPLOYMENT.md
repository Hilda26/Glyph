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

No funded signer was available in this build environment, so live deployment evidence is not recorded here. That is the single external blocker for real addresses and explorer links.
