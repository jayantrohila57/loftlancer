# `@loftlancer/crypto`

Thin **Node.js `node:crypto`** integration for AES-256-GCM encrypt/decrypt.

Not a third-party cipher SDK (`@noble/*`, `iron-webcrypto`, etc.) — the provider is Node’s built-in crypto module.

## Layout

```text
src/
  core/node-crypto.core.ts       # encryptWithKey / decryptWithKey
  config/node-crypto.env.ts      # encrypt / decrypt via ENCRYPTION_KEY
  constants/node-crypto.constants.ts
  tests/
  index.ts
```

## Env

| Variable         | Role                         |
| ---------------- | ---------------------------- |
| `ENCRYPTION_KEY` | 64 hex characters (32 bytes) |

## Public API

- `encrypt` / `decrypt` — use `env.ENCRYPTION_KEY`
- `encryptWithKey` / `decryptWithKey` — pass an explicit hex key (tests, tooling)

Ciphertext format: `iv:authTag:ciphertext` (base64 parts).

Keep product/domain encryption rules in `module/`; this package only provides primitives and the env adapter.
