# Demo Path

1. Open `/`.
2. Confirm the hero shows a scanned folio moving under a loupe and the Studionet wallet button is visible.
3. Open `/tasks` and select a fixture folio.
4. Inspect `/t/1` and verify source SHA-256, reward, status, and definition hash are visible.
5. Open `/t/1/transcribe`.
6. Use zoom, rotate, brightness, and contrast controls. These are local CSS helpers only.
7. Type a transcription. Refresh and confirm the draft persists locally.
8. With deployed addresses and a Studionet wallet configured, submit the transcription and follow lifecycle states:
   - `AWAITING_SIGNATURE`
   - `SUBMITTED`
   - `CONSENSUS_RUNNING`
   - `FINALIZED`
   - `EXECUTION_CONFIRMED`
   - `STATE_REREAD`
9. Open `/submission/1` for an accepted receipt and `/submission/2` for an inconclusive receipt.
10. Open `/new` to create a sponsor draft after deployment addresses are configured.

