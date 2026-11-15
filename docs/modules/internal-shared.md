# Modules — internal `shared/`

**Prev:** [api-structure.md](./api-structure.md)

## Inside one domain (`modules/<slug>/src/client/`)

Colocate **domain screens and client leaves** under `client/components/` and `client/hooks/`. Helpers shared by **multiple screens in that module only** live beside those components (same `client/` tree), not in other domains.

## Cross-app chrome (`modules/shell/`)

Account-area chrome and nav **configs** reused across apps: `ShellAccountFrame`, `AccountSectionSubnav`, sidebar/tab configs, hub tiles. Generic layout primitives stay in **`@features/shell`**.

**MUST NOT** put other business domains (`users`, `payments`, …) in `shell`. **MUST NOT** put account tab configs or `/account` href rules in `@features/shell`.

## vs app `src/shared/`

| Location                     | Scope                                               |
| ---------------------------- | --------------------------------------------------- |
| `apps/<app>/src/shared/`     | This deployable app’s i18n, route types, app config |
| `modules/<slug>/src/client/` | That module’s screens, leaves, and internal reuse   |
| `modules/shell/`             | Multi-app chrome, no business domain                |

**Next:** [wiring.md](./wiring.md)
