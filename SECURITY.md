# Security Notes

- Devnet-only guard is enforced in backend config.
- Agent secret keys are encrypted at rest with AES-256-GCM.
- Master key must be provided via `KEYSTORE_MASTER_KEY`.
- Signing path includes program allowlist and spend caps.
- Simulation runs before broadcast when building wallet transactions.
- Confirmation checks signature status and blockhash expiration.

## TODO (Production Hardening)

- Replace local keystore with cloud KMS/HSM.
- Persist policy counters in a durable store.
- Add nonce/replay protections and richer tx inspection.
- Add key rotation and emergency revoke workflows.
