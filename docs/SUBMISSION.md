# Submission Checklist

## Current State

Glyphwork is locally complete and verified:

- Next.js 16, React 19, TypeScript strict mode, Tailwind 4.
- GenLayer Studionet-only configuration.
- `genlayer-js` pinned exactly to `1.1.8`.
- Tasks and Vault Intelligent Contracts.
- Live-read-first frontend with fixture fallback.
- Wallet connect, wrong-network guard, transaction lifecycle, and explorer links.
- Unit/component tests, contract preflight checks, CI, production build, and Playwright smoke tests.

## Deployed Contracts

- Network: Studionet `61999`
- Tasks: `0x0fcbeFD1D4e0B36f57E8F9B0d143F3FFc1c5D593`
- Vault: `0xaF0B724b2a990Fc4E2C5D57db21Aea2b3Fb71507`
- Evidence: `docs/deployment-evidence/latest.json`

## Before Final Submission

1. Optional redeploy with a funded Studionet signer:

```bash
$env:GLYPHWORK_DEPLOYER_PRIVATE_KEY="0x..."
node scripts/deploy-studionet.mjs
```

2. Copy the printed addresses into `.env.local` and the deployment environment:

```bash
NEXT_PUBLIC_GLYPHWORK_TASKS_ADDRESS=0x...
NEXT_PUBLIC_GLYPHWORK_VAULT_ADDRESS=0x...
NEXT_PUBLIC_STUDIONET_RPC=https://studio.genlayer.com/api
NEXT_PUBLIC_STUDIONET_CHAIN_ID=61999
```

3. Run a funded demo:

- create draft from `/new`;
- fund exact reward from `/t/[id]`;
- verify/open source from `/t/[id]`;
- submit transcription from `/t/[id]/transcribe`;
- evaluate from `/t/[id]`;
- confirm payout/refund with `/submission/[id]`, `/archive`, and Vault `conservation()`.

4. Record final evidence:

- commit SHA;
- signer address;
- Tasks and Vault addresses;
- deployment, funding, opening, submission, evaluation, payout/refund transaction hashes;
- explorer links;
- authoritative readbacks;
- a short screen recording or screenshots of the live path.

## Remaining Polish Before Judging

- Run one funded demo bounty through create, fund, open, submit, evaluate, and payout/refund.
- Append those lifecycle transactions and readbacks to `docs/deployment-evidence/latest.json`.
- Add screenshots or a short recording of the live demo path if the submission portal supports media.
