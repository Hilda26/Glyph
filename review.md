# Review Response Summary

This file summarizes the changes made in response to the team review:

> Please make the binding transcription rules and minor-error policy visible before submission, ensure KEY_VALUE review covers every configured field uniquely and cannot turn an explicit rejection or inconclusive result into acceptance, and connect source-unavailable handling to the Vault refund method. Please also read the actual Vault payout state for receipts and add behavioral tests that demonstrate these corrected payment and recovery paths.

## Completed Changes

- Binding transcription rules are visible before submission in the transcription workbench.
- Minor-error policy is visible before submission and on the folio detail page.
- KEY_VALUE review now requires every configured field to be covered uniquely before acceptance.
- Explicit `REJECT` and `INCONCLUSIVE` model/consensus results can no longer be upgraded into `ACCEPT`.
- Source-unavailable evaluation now calls the Vault `refund_unavailable` path.
- Submission receipts now read actual Vault settlement state with `was_paid` and `was_refunded`.
- Behavioral tests were added for:
  - KEY_VALUE configured-field coverage.
  - Explicit rejection/inconclusive handling.
  - Minor-error policy gating.
  - Source-unavailable recovery classification.
  - Receipt reads of Vault payment/refund state.

## Deployment

- Latest pushed commit: `0034564` - `Address Glyph review feedback`
- Production app: https://glyph-lake.vercel.app
- Latest production deployment: https://glyph-4xringx3o-auras-projects-2f862c53.vercel.app

## Current Contracts

- Tasks: `0x2Eb674387e52c79A9Ee48ee2a01630c959c9630d`
- Vault: `0xd13622176dDA146d2c86DB10c8b2b29bDbEf7BF8`

## Verification

- `npm run check` passed.
- `npm run test:e2e` passed.
- Production smoke checks passed for:
  - `/t/1/transcribe` showing binding rules before submission.
  - `/submission/1` showing Vault payout finalized from actual Vault state.
- Live demo evidence records:
  - Bounty `1`
  - Submission `1`
  - Result `ACCEPT`
  - Vault settlement `was_paid=true`, `was_refunded=false`

## Notes

`genvm-lint` lint phase passed for both contracts. Its validation phase reports `E105 No contract class found` for both contract files, including the existing Vault contract shape, which appears to be a parser limitation with this project style rather than a new contract regression.
