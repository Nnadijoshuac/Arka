## Security Hygiene

This repository is configured to avoid committing operational secrets.

### Never Commit
- `.env`, `.env.local`, or any `.env.*` file (except `.env.example`)
- Solana keypair files such as `id.json`
- Private key exports (`*.pem`, `*.key`, `*.p12`)

### Safe Configuration Pattern
- Keep only placeholders in tracked example files:
  - `.env.example`
  - `apps/web/.env.example`
- Store runtime secrets in your hosting provider environment settings.

### Quick Manual Checks Before Push
- `git status --short` to confirm no secret files are staged.
- `rg -n "(PRIVATE KEY|SIGNER_PRIVATE_KEY=\\[|TELEGRAM_BOT_TOKEN=\\d)" -S .`

If a secret was ever exposed, rotate it immediately.
