# Agent Runtime Skills

Purpose: autonomous agent execution in a Solana devnet sandbox.

## Allowed Networks

- `devnet` only
- Reject `mainnet-beta`

## Allowed Program IDs

- System Program: `11111111111111111111111111111111`
- SPL Token Program: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- Associated Token Program: `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`
- Compute Budget Program: `ComputeBudget111111111111111111111111111111`
- Mock DeFi Program: from `PROGRAM_ID`

## Spend Policy

- Max lamports per transfer: configured in backend policy
- Max token swap amount: configured in backend policy
- Daily cap per agent: in-memory counter

## Commands

- Start backend: `pnpm --filter backend dev`
- Start web: `pnpm --filter web dev`
- Run demo: `pnpm demo:devnet`

## Add New Strategy

1. Implement `AgentStrategy` in `apps/backend/src/agents/strategies`
2. Register strategy in `agentRunner.ts`
3. Add tests in `apps/backend/test/agentRunner.test.ts`

## Module Pointers

- Wallet and signing: `apps/backend/src/wallet`
- Policy gate: `apps/backend/src/wallet/txPolicy.ts`
- Keystore: `apps/backend/src/keystore`

## Safety Rule

- Never log private keys or decrypted secret bytes.
