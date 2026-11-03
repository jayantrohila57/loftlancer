Fixes #

## Sub-issues closed

<!-- List sub-task issue numbers, e.g. Fixes #920, Fixes #921 -->

## What changed

## Checklist

- [ ] One commit per sub-issue where applicable; each says `Fixes #N` (or `Refs #N` for partial work)
- [ ] Targets **`dev`** only (never land feature/fix/docs work on `main`; production is **`dev` → `main`** only); no `--no-verify`
- [ ] **`pnpm verify:dev-merge`** pass on full branch (lint, routes, architecture audit, types, tests)
- [ ] **`pnpm audit:module-architecture`** — no **new** violations
- [ ] `module/<domain>/README.md` updated if boundaries, verification, or blocked TODOs changed
- [ ] No secret values; env var names only (`docs/integrations.md` updated if services changed)
- [ ] Prod DB migration: Neon backup branch taken (or N/A)
- [ ] UI: reui-first, dense layout, zero layout shift, Jayant's tokens; before/after screenshots attached (or N/A)
- [ ] CHANGELOG.md updated if user-facing
