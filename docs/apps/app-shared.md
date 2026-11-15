# Apps — `src/shared/`

**Prev:** [route-layouts.md](./route-layouts.md)

App-local only — used across **multiple routes in this app** (e.g. `/users`, `/teams`).

| Area                | Examples                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/i18n/`      | Message catalogs + i18n shims — [../features/i18n/](../features/i18n/) · [../../features/i18n/AGENTS.md](../../features/i18n/AGENTS.md) |
| `shared/types/`     | `<slug>.app.types.ts` — route `params` / layout props                                                                                   |
| `shared/config/`    | App env wiring (small)                                                                                                                  |
| `shared/constants/` | App-wide literals (not domain rules)                                                                                                    |

**MUST NOT** put domain user/team/payment logic here — that belongs in `@modules/<domain>`.

Cross-app **non-business** chrome (breadcrumb, back, language control wrappers) → `@modules/shell` or `@features/*`, not app `shared/`.
