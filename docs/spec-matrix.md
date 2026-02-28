# Spec Matrix

| Requirement | Status | Mapping |
|---|---|---|
| `/demo/setup` creates mints, ATAs, seeds, init attempt | Implemented | `apps/backend/src/routes/demo.ts` |
| `/demo/run` fixed rounds and signatures | Implemented | `apps/backend/src/routes/demo.ts` |
| Demo script setup + run + summary | Implemented | `apps/backend/src/demo.ts` |
| Wallet simulate + confirm + retry | Implemented | `apps/backend/src/wallet/txBuilder.ts`, `apps/backend/src/wallet/confirm.ts` |
| Persistent spend DB + tx policy integration | Implemented | `apps/backend/src/policy/spendDb.ts`, `apps/backend/src/wallet/txPolicy.ts` |
| Vitest coverage for spend db/policy | Implemented | `apps/backend/test/spendDb.test.ts`, `apps/backend/test/policy.test.ts` |
| `.env.example` includes PROGRAM_ID + KEYSTORE_MASTER_KEY | Implemented | `.env.example` |
| CI lint + unit + anchor test (optional) | Implemented | `.github/workflows/ci.yml` |
| Program ID constant source | Implemented | `apps/backend/src/solana/constants.ts` |

Notes:
- Exact line numbers may shift as files evolve; mapping is by file path.
- `anchor deploy` and writing `PROGRAM_ID` remain an environment-time step and are documented in README.
