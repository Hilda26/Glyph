# Contract Surface

## `contracts/glyphwork_tasks.py`

### Writes

- `set_vault_once(vault: Address)`: owner-only one-time vault binding.
- `create_draft(...) -> str`: creates a draft bounty with sealed source, schema, reward, deadline, attempts, and policy.
- `vault_mark_funded(bounty_id: str)`: vault-only transition from `DRAFT` to `FUNDED`.
- `verify_source_and_open(bounty_id: str)`: sponsor-only nondeterministic source availability/hash check, then `OPEN`.
- `submit_transcription(bounty_id, transcription, uncertainty, note) -> str`: bounded worker submission.
- `evaluate_active_submission(bounty_id) -> str`: independent multimodal review and deterministic policy mapping.
- `expire_and_refund(bounty_id)`: deadline path to Vault refund.
- `mark_paid(bounty_id)`: vault-only final paid marker.
- `mark_refunded(bounty_id)`: vault-only final refunded marker.

### Views

- `get_bounty(bounty_id) -> Bounty`
- `get_submission(submission_id) -> Submission`
- `get_reward_wei(bounty_id) -> u256`
- `get_sponsor(bounty_id) -> Address`
- `get_bounty_payment_state(bounty_id) -> tuple[str, Address, Address, u256]`

## `contracts/glyphwork_vault.py`

### Writes

- `fund_bounty(bounty_id)` payable: accepts exactly the stored reward from the sponsor.
- `release_accepted(bounty_id, worker)`: Tasks-only exact-once payout to accepted worker.
- `refund_expired(bounty_id)`: Tasks-only refund to sponsor.
- `refund_unavailable(bounty_id)`: Tasks-only refund to sponsor.

### Views

- `is_funded(bounty_id) -> bool`
- `was_paid(bounty_id) -> bool`
- `was_refunded(bounty_id) -> bool`
- `conservation() -> tuple[u256, u256, u256, u256]`

