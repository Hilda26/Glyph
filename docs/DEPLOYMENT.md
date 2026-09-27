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
- Tasks: `0x5D28D755EEeD3a3C440103d9c7ca2068A640B6A1`
- Vault: `0xD2D1AdB4AD94Ea6769Ef23271b24771E97a0B495`
- Tasks deploy tx: `0x1c168e027e943e81fe54b2e09a209a877be5d838e84515bd4e1b6f3dbe6f6fc0`
- Vault deploy tx: `0xc31d6e46f4cae63eacac63ca0c6da402666ea845091ec262bc377613c9132f0c`
- Vault binding tx: `0xb2f16617d68e3aa27e23d38d6dd18c693c7c850bc55172cf2bb06e20885fa122`

Latest live demo readbacks:

- Bounty `2`: `ACCEPTED`
- Submission `2`: `ACCEPT`
- Source match: `MATCH`
- Accuracy: `ACCURATE`
- `conservation()`: `[2000000000000000, 0, 0, 2000000000000000]`

Full deployment receipts are recorded in `docs/deployment-evidence/latest.json`. The funded create/fund/open/submit/evaluate lifecycle is recorded in `docs/deployment-evidence/live-demo.json`.

## Production Hosting

Deployed on Vercel.

- Project: `glyph`
- Production URL: `https://glyph-lake.vercel.app`
- Deployment URL: `https://glyph-gn9r35our-auras-projects-2f862c53.vercel.app`
- Deployment ID: `dpl_CT4AhrJ3r8CpkuiitpVwL78NMuKb`

Persistent Vercel environment variables are configured for Production, Preview, and Development:

- `NEXT_PUBLIC_GLYPHWORK_TASKS_ADDRESS`
- `NEXT_PUBLIC_GLYPHWORK_VAULT_ADDRESS`
- `NEXT_PUBLIC_STUDIONET_RPC`
- `NEXT_PUBLIC_STUDIONET_CHAIN_ID`
