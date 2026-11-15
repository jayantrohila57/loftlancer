# Package `t3-env`

T3 Env (`@t3-oss/env-*`). Folder **`t3-env`** → **`@packages/t3-env`**.

| Export                    | Use                                              |
| ------------------------- | ------------------------------------------------ |
| `@packages/t3-env/server` | Server — `src/server/*`, `.env` at app cwd       |
| `@packages/t3-env/client` | Client — `src/client/*`, `.env.local` at app cwd |

**MUST NOT** use `process.env` outside `src/server/env.ts` and `src/client/env.ts`.
