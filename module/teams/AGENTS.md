# Teams module (Codex scope)

**Read first:** [README.md](./README.md) — migration boundaries, verification, TODO (blocked).

**Structural tree only:** [docs/reference-module-teams.md](../../docs/reference-module-teams.md).

## This session

- Implement **one sub-issue** for parent **#916** (or linked sub-task), not the full pilot.
- Branch: `feat/916-<slug>` from **`dev`**; commit **`Fixes #<sub-issue>`**.
- Do **not** copy `packages/orpc/src/modules/teams/*` or removed `apps/studio/src/lib/team-*` for new behavior.

## Done when

```bash
pnpm audit:module-architecture
pnpm check-types
pnpm test:teams
```

Before merging the issue branch to **`dev`**: **`pnpm verify:dev-merge`**.

Update **this README** (sub-issues table, TODO blocked) — not new files under `docs/`.
