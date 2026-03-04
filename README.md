# Autarch District
[![CI](https://github.com/Nnadijoshuac/AutarchDistrict/actions/workflows/ci.yml/badge.svg)](https://github.com/Nnadijoshuac/AutarchDistrict/actions/workflows/ci.yml)

Autarch District is a production-leaning prototype for **agentic wallets on Solana devnet**.

## Problem
AI agents can only be autonomous onchain if they can own wallets, hold assets, sign transactions without manual approval, and operate under enforceable risk controls.

Most demos stop at scripted calls. They do not provide durable wallet custody, policy enforcement, observability, or operator controls for multi-agent systems.

## Why AI Agents Need Wallets
- They need independent identities (per-agent keypairs/public keys).
- They need to hold SOL/SPL balances directly.
- They need unattended transaction signing to act in real time.
- They need constrained execution boundaries to reduce blast radius.

## What Autarch District Solves
- Programmatic creation of independent agent wallets.
- Encrypted key custody (envelope encryption via KMS abstraction).
- Policy-gated transaction execution (allowlists, spend limits, slippage caps).
- Multi-agent runner with selectable strategy modules.
- Persistent agent/transaction/violation state in Postgres (Prisma).
- Real-time monitoring over WebSocket + Telegram notifications and command controls.

## Live Endpoints
- Frontend: `https://autarchdistrict.vercel.app`
- Backend: `https://autarchdistrict.onrender.com`
- Health: `https://autarchdistrict.onrender.com/health`

## Demo GIF
`docs/demo.gif` (placeholder)

## Architecture Diagram
```mermaid
flowchart LR
  subgraph UI[Frontend (Next.js)]
    L[Landing]
    D[Dashboard]
  end

  subgraph API[Backend (Fastify)]
    R[REST + WS]
    AR[Agent Runner]
    ST[Strategy Loader]
    PE[Policy Engine]
    WE[Wallet Executor]
    KS[Keystore + KMS]
    DB[(Postgres/Prisma)]
    MT[Metrics + Logs]
    TG[Telegram Commands/Alerts]
  end

  subgraph CHAIN[Solana Devnet]
    MDF[Mock DeFi Program]
    SPL[SPL Token Program]
    SYS[System Program]
  end

  D --> R
  L --> D
  R --> AR
  AR --> ST
  AR --> WE
  WE --> PE
  WE --> KS
  AR --> DB
  R --> DB
  AR --> TG
  AR --> MT
  WE --> CHAIN
  CHAIN --> MDF
  CHAIN --> SPL
  CHAIN --> SYS
```

## Security Model Summary
- **Devnet-only enforcement**: backend refuses non-devnet RPC.
- **Envelope encryption**: per-agent secret encrypted with a random data key; data key encrypted by KMS master key.
- **No plaintext persistence**: secrets are encrypted at rest only.
- **Policy enforcement before signing/sending**:
  - `DENY_PROGRAM_NOT_ALLOWED`
  - `DENY_MAX_SPEND`
  - `DENY_DAILY_LIMIT`
  - `DENY_SLIPPAGE_EXCEEDED`
- **Simulation before send** to reduce failed transactions.
- **Circuit breaker** pauses all agents when failure rate breaches threshold.

## Threat Model
### In scope
- Rogue/buggy strategy attempting disallowed program calls.
- Excessive spend by a single agent.
- Burst failure storms from RPC instability.
- Loss of in-memory process state on restart.

### Mitigations
- Program allowlist + hard policy checks.
- Per-agent daily/per-tx spend limits.
- Circuit breaker + manual resume endpoint.
- Postgres-backed persistence + startup restore.
- Structured logs and Prometheus metrics for auditability.

### Out of scope (prototype)
- HSM-backed production KMS.
- Mainnet economic guarantees.
- Formal verification of strategy logic.

## Feature Checklist (Bounty Mapping)
- Create wallet programmatically: ✅
- Sign transactions automatically: ✅
- Hold SOL/SPL tokens: ✅
- Interact with test dApp/protocol: ✅ (Anchor mock DeFi program)
- Multi-agent support: ✅
- Security and key management controls: ✅
- Open-source setup and docs: ✅
- Devnet working prototype: ✅

## Repository Structure
- `apps/backend` - Fastify API, runner, policy, wallet, security, metrics
- `apps/web` - Next.js landing + control dashboard
- `programs/agent_mock_defi` - Anchor mock DeFi program
- `DEEP_DIVE.md` - design + security deep dive
- `SKILLS.md` - agent operation rules

## Backend Environment Variables
Use `.env.example` as baseline.

Required:
- `SOLANA_RPC_URL=https://api.devnet.solana.com`
- `SOLANA_WS_URL=wss://api.devnet.solana.com`
- `PROGRAM_ID=<deployed_program_id>`
- `KMS_PROVIDER=dev`
- `KMS_MASTER_KEY_BASE64=<32-byte-base64>`
- `DATABASE_URL=<postgres_connection_string>`
- `WEB_ORIGIN=<frontend_origin>`

Optional:
- `DATA_DIR` (persistent local artifacts path)
- `TELEGRAM_NOTIFICATIONS_ENABLED`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_NOTIFY_AGENT_EVENTS`
- `TELEGRAM_NOTIFY_ON_SUCCESS`
- `TELEGRAM_NOTIFY_ON_VIOLATION`
- `TELEGRAM_NOTIFY_ON_ERROR`

## Local Run
1. Install dependencies:
```bash
corepack pnpm install
```
2. Configure env files:
```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
```
3. Build/deploy Anchor program to devnet (if needed):
```bash
pnpm anchor:build
pnpm anchor:deploy:devnet
```
4. Start backend + frontend:
```bash
pnpm dev
```

## API Surface
- `GET /health`
- `GET /agents`
- `POST /agents`
- `PATCH /agents/:agentId/policy`
- `PATCH /agents/:agentId/strategy`
- `GET /strategies`
- `GET /policy-violations`
- `POST /demo/setup`
- `POST /demo/run`
- `POST /demo/stop`
- `GET /metrics`
- `POST /circuit-breaker/resume`
- `GET /ws` (agent-scoped subscriptions supported via `?agentId=...`)

## Telegram Commands
- `/status`
- `/stop <agentId>` (or `/stop` for all)
- `/start <agentId>` (or `/start` for all)

## Deployment Notes
### Render (backend)
- Use a persistent disk for `DATA_DIR`.
- Set all backend env vars in Render dashboard.

### Vercel (frontend)
- `NEXT_PUBLIC_API_BASE` should target backend URL.
- `NEXT_PUBLIC_WS_URL` should target backend `/ws`.

## Judge Flow
1. Open frontend `/app`.
2. Click **Run Full Demo**.
3. Observe progress tracker, live events, policy table, and agent detail updates.
4. Validate metrics endpoint and Telegram alerts/commands.

## CI
GitHub Actions runs:
- install
- lint
- test
- backend build
- web build
