# Architecture

Glyphwork has three boundaries:

1. `glyphwork_tasks.py` is the canonical task registry. It owns IDs, source URL canonicalization, source hash sealing, submission bounds, deadline checks, attempts, multimodal evaluation, and the deterministic mapping from findings to status.
2. `glyphwork_vault.py` is the custody boundary. It accepts exactly the sealed reward amount, records credited deposits, pays only the accepted worker from Tasks state, and refunds only through Tasks-triggered expiry or unavailable paths.
3. The browser is a direct GenLayer client. It uses `genlayer-js` on Studionet, an unsigned read client for public reads, and the injected EIP-1193 provider for writes.

No database, server wallet, server AI endpoint, cron source of truth, or off-chain adjudication service exists in this repository.

## Contract Flow

1. Sponsor calls `create_draft(...)` on Tasks with title, source URL, expected SHA-256, schema, rules, reward, deadline, max attempts, and minor-error policy.
2. Sponsor calls `fund_bounty(bountyId)` on Vault with exactly the task reward in GEN.
3. Vault records the deposit and emits `vault_mark_funded` to Tasks.
4. Sponsor calls `verify_source_and_open(bountyId)` on Tasks. Leader and validator independently fetch the immutable image and verify the expected hash before status becomes `OPEN`.
5. Worker calls `submit_transcription(...)` with bounded text/JSON, uncertainty flag, and note.
6. Anyone can call `evaluate_active_submission(...)`. Leader and validator independently fetch the same image, hash it, call a vision-capable LLM with hostile-source warnings, and compare material fields.
7. If accepted, Tasks records the accepted worker and emits `release_accepted` to Vault.
8. Vault re-reads Tasks state, verifies the beneficiary and reward, marks the deposit paid, transfers GEN, and asks Tasks to mark paid.
9. Expired or source-unavailable tasks emit refund paths to Vault, which transfers the stored deposit back to the sponsor exactly once.

## Frontend Shape

The App Router project keeps domain code out of page components:

- `lib/genlayer`: shared Studionet network and explorer helpers.
- `lib/contract`: typed adapters and address configuration.
- `lib/wallet`: injected provider and wallet error helpers.
- `lib/transactions`: lifecycle stages and failures.
- `lib/validation`: BigInt-safe GEN parsing and source URL normalization.
- `components`: wallet, network guard, workbench, sponsor form, source viewer, bounty list.

The visual thesis is a restoration desk and archival transcription studio. MotionSites references inspected: `Digital Epoch`, `Impressive Hero`, and `Shamoni` from https://motionsites.ai/. The adopted principles are large first-viewport identity, kinetic hero object, strong typographic hierarchy, and split-screen tool focus. Glyphwork reinterprets these with vellum, registry blue, ruled paper, accession marks, and a source-dominant workbench.

