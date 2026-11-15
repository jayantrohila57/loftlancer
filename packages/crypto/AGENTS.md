# Package `crypto`

Node `node:crypto` AES-256-GCM helpers. Folder **`crypto`** → **`@packages/crypto`**.

| Export                    | Use                                                                    |
| ------------------------- | ---------------------------------------------------------------------- |
| `@packages/crypto`        | `encryptWithKey` / `decryptWithKey`, constants, `CryptoError`          |
| `@packages/crypto/server` | `encrypt` / `decrypt` via `ENCRYPTION_KEY` (`@packages/t3-env/server`) |

Library-only — no product variables feature. Domain rules belong in modules.

**MUST NOT** read raw `process.env` — use `@packages/t3-env/server` on the server entry.
