# Glyphwork

Glyphwork is a GenLayer Studionet app for public-domain archival transcription bounties. A sponsor creates a hash-locked source folio, funds a fixed GEN reward, and a worker submits structured transcription. The Tasks Intelligent Contract evaluates the immutable image and submission through independent multimodal leader/validator review. The Vault Intelligent Contract releases the fixed reward once, or refunds the sponsor on expiry or source-unavailable paths.

## Network

Glyphwork is intentionally pinned to GenLayer Studionet only:

- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Currency: `GEN`
- `genlayer-js`: exactly `1.1.8`

`npm run check:network` fails if production configuration drifts from those values.

## Local Setup

```bash
npm install
npm run check
npm run dev
```

Set deployed contract addresses in `.env.local` after Studionet deployment:

```bash
NEXT_PUBLIC_GLYPHWORK_TASKS_ADDRESS=0x...
NEXT_PUBLIC_GLYPHWORK_VAULT_ADDRESS=0x...
NEXT_PUBLIC_STUDIONET_RPC=https://studio.genlayer.com/api
NEXT_PUBLIC_STUDIONET_CHAIN_ID=61999
```

## Contracts

- `contracts/glyphwork_tasks.py`: task definitions, source immutability, submissions, independent image-based evaluation, acceptance policy, expiry/refund trigger.
- `contracts/glyphwork_vault.py`: fixed GEN custody, exact funding, accepted-worker payout, expiry/source-unavailable refunds, conservation accounting.

Deploy order:

1. Deploy `glyphwork_tasks.py`.
2. Deploy `glyphwork_vault.py` with the Tasks address.
3. Call `tasks.set_vault_once(vaultAddress)`.

No private key or mnemonic is stored in this repo. Live funded deployment is intentionally external and opt-in.

## Frontend

Routes:

- `/`: archive landing with folio/loupe motion.
- `/tasks`: open folios.
- `/t/[id]`: source folio detail.
- `/t/[id]/transcribe`: transcription workbench.
- `/submission/[id]`: comparison receipt.
- `/archive`: completed records.
- `/new`: sponsor flow.
- `/me`: local desk view.

Fixture records are original project-created source images for development and tests. They are not presented as live on-chain truth unless deployed contract addresses are configured and read through the adapters.

## Checks

```bash
npm run check:network
npm run contracts:compile
npm run contracts:preflight
npm run lint
npm run typecheck
npm run test
npm run build
```

Playwright is available with `npm run test:e2e`.

