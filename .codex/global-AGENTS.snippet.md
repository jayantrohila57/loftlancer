# Optional paste into ~/.codex/AGENTS.md

When working in **loftlancer** (github.com/jayantrohila57/loftlancer):

- Branch from **`dev`** only; never commit ordinary work on **`main`**.
- Implement **sub-task issues**, one commit per sub-issue (`Fixes #N`).
- Read **`module/<domain>/README.md`** before editing that domain.
- Never use legacy `apps/studio/src/module/*` or `packages/orpc/src/modules/*` as templates for new product code.
- Before finishing: **`pnpm audit:module-architecture`**; before PR: **`pnpm verify:dev-merge`**.

Repository **`AGENTS.md`** and nested files override this snippet for loftlancer checkouts.
