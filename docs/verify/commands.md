# Verify commands

Run before claiming work is done (unless the change is docs-only).

| Task                      | Command                     |
| ------------------------- | --------------------------- |
| Install                   | `pnpm install`              |
| Format + lint + typecheck | `pnpm check`                |
| Presentation formatting   | `pnpm check:i18n`           |
| CI (no writes)            | `pnpm check:ci`             |
| Pre-commit (staged files) | `lint-staged` (via Husky)   |
| Full pre-push gate        | `pnpm check:commit`         |
| Auto-fix (Biome safe)     | `pnpm fix`                  |
| Dev (example)             | `pnpm dev --filter web`     |
| After Next config / proxy | `pnpm build --filter <app>` |

**Node:** `>=26.0.0` (see `.nvmrc`). **Package manager:** `pnpm` 12 (see `packageManager` in `package.json`).

`pnpm install` sets up Husky. Before each commit, `.husky/pre-commit` runs
**`lint-staged`** only (Biome check --write on staged files). The full gate is
manual: **`pnpm check:commit`** (`check:ci` + `pnpm build`).

The CLI uses TypeScript 7. The workspace editor SDK uses the `typescript-programmatic` TypeScript 5.9 alias for the JavaScript language server and Next.js editor plugin. In VS Code, select **TypeScript: Select TypeScript Version → Use Workspace Version**. The i18n scripts also use this alias for the compiler API.

Codex copy of this table: [../../CODEX.md](../../CODEX.md).

Internationalization presentation checks: [i18n.md](./i18n.md).

Release and changelog (see [../releasing.md](../releasing.md)):

| Task                                | Command                                      |
| ----------------------------------- | -------------------------------------------- |
| Prepare a version bump              | `pnpm release:prepare <major\|minor\|patch>` |
| Validate vs `loftlancer-production` | `pnpm release:check`                         |
| Print release notes                 | `pnpm release:notes`                         |
| Tag and GitHub Release              | `RELEASE_PUBLISH=1 pnpm release:publish`     |
