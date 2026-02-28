# Deep Dive: Agentic Wallet Prototype on Solana Devnet

## Design Rationale

The design separates agent decision logic from wallet execution. Agents decide an action, while wallet modules enforce cluster guardrails, allowlists, spend caps, simulation checks, and confirmation discipline.

## Key Management and Threat Model

Threats include secret key leakage and malicious transaction requests.

Mitigations:

- AES-256-GCM encrypted keystore (`apps/backend/data/keystore.json`)
- Master key in `KEYSTORE_MASTER_KEY`
- Decrypt only in memory during signing
- Secret values excluded from logs
- Signer provider abstraction for future KMS migration

## Automated Signing Flow

1. Build transaction instructions
2. Validate policy (network, allowlist, amount caps)
3. Fetch latest blockhash
4. Simulate transaction
5. Sign and send
6. Confirm via signature status polling

## Confirmation and Expiration Handling

The backend tracks `lastValidBlockHeight` returned by `getLatestBlockhash("confirmed")` and polls status until confirmed/finalized or expiration. On expiration, it rebuilds and retries within bounded attempts.

## Protocol Interaction and PDAs

The Anchor program uses PDA-based authority for pool vault token accounts. This reduces private key custody for protocol authorities and aligns with deterministic account derivation.

## Scalability Strategy

- Multi-agent loops with per-agent lock
- Global rate limiter for RPC pressure control
- Concurrency guard with bounded parallel actions
- Structured logs and event stream for observability

## Future Work

- Real KMS/HSM signer implementation
- Persistent policy counters and richer risk controls
- Better metrics sinks (Prometheus/OpenTelemetry)
- Optional multisig and fee sponsorship integrations
