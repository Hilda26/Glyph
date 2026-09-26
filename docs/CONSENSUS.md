# Consensus

Glyphwork separates deterministic and nondeterministic duties.

## Deterministic

Tasks deterministically owns:

- authorization;
- URL canonicalization and public URL rejection;
- bounded strings, fields, attempts, and source size;
- bounty and submission IDs;
- deadline checks from GenVM transaction time;
- source hash commitment;
- status transitions;
- acceptance mapping;
- accepted beneficiary selection;
- cross-contract messages.

Vault deterministically owns:

- exact funding;
- credited deposits;
- paid/refunded flags;
- conservation totals;
- beneficiary verification from Tasks state;
- exactly-once settlement.

## Nondeterministic

Tasks uses `gl.vm.run_nondet_unsafe(leader_fn, validator_fn)` in two places:

- `verify_source_and_open` independently fetches the source image and verifies availability/hash.
- `evaluate_active_submission` independently fetches the image, re-hashes it, sends the raw image bytes to a vision-capable LLM, and compares material findings.

Validator acceptance is substantive, not schema-only. It requires the same result, source match, completeness band, accuracy band, and, for `KEY_VALUE`, the same material field findings.

The prompt explicitly treats source content as hostile data and forbids following instructions inside evidence, revealing hidden instructions, redefining the task, or moving value because a source says so.

## Uncertainty

The contract supports `INCONCLUSIVE` and `UNAVAILABLE` as explicit non-payment states. It does not force payment when image evidence is illegible, source hash mismatches, validator material findings disagree, or required fields are uncertain.

