Fixes #

## What changed

## Checklist
- [ ] Every commit says `Fixes #N` (or `Refs #N` for partial work)
- [ ] Targets **`dev`** only (never land feature/fix/docs work on `main`; production is **`dev` → `main`** only); no `--no-verify`
- [ ] `pnpm check-types`, `pnpm test`, `pnpm lint:ci` and turbo build pass
- [ ] No secret values; env var names only (`docs/integrations.md` updated if services changed)
- [ ] Prod DB migration: Neon backup branch taken (or N/A)
- [ ] UI: reui-first, dense layout, zero layout shift, Jayant's tokens; before/after screenshots attached (or N/A)
- [ ] CHANGELOG.md updated if user-facing
