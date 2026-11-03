# Codex setup (loftlancer)

OpenAI **Codex** (CLI, IDE, and GitHub) loads **`AGENTS.md`** from the repo root and **nested `AGENTS.md`** files along the path to your working directory. Cursor uses **`.cursor/rules/*.mdc`** for the same policies; Codex does **not** read those files automatically.

## One-time setup

1. **Trust the project** when Codex asks — required for **`.codex/hooks.json`** in this repo.
2. Approve hooks: run **`/hooks`** in Codex TUI and enable the workspace Stop hook (architecture audit).
3. Optional — raise instruction size if nested `AGENTS.md` truncates:

   Copy [config.toml.example](./config.toml.example) into **`~/.codex/config.toml`** (merge with existing), or:

   ```bash
   export CODEX_HOME="$HOME/.codex"
   ```

4. Optional — global defaults for all repos: merge [global-AGENTS.snippet.md](./global-AGENTS.snippet.md) into **`~/.codex/AGENTS.md`**.

## Instruction chain (this repo)

| When working in… | Codex loads (in order)      |
| ---------------- | --------------------------- |
| Repo root        | `AGENTS.md`                 |
| `module/`        | + `module/AGENTS.md`        |
| `module/teams/`  | + `module/teams/AGENTS.md`  |
| `packages/orpc/` | + `packages/orpc/AGENTS.md` |

**Module runbooks:** `module/<domain>/README.md` (not duplicate docs under `docs/`).

## Verification (same as CI)

| When               | Command                          |
| ------------------ | -------------------------------- |
| After a sub-issue  | `pnpm audit:module-architecture` |
| Before PR to `dev` | `pnpm verify:dev-merge`          |

The **Stop** hook runs **`pnpm audit:module-architecture`** when the turn changed `module/`, `packages/orpc/src/orpc/`, or app `page.tsx` files.

## GitHub Codex code review

Review rules live in **`AGENTS.md` → Code Review Rules**. Keep checks aligned with **`pnpm audit:module-architecture`** — do not approve PRs that add new baseline violations or copy legacy app/API modules as templates.

## Verify discovery

```bash
codex --cd module/teams --ask-for-approval never "List which AGENTS.md files you loaded."
```

Expected: root `AGENTS.md`, `module/AGENTS.md`, `module/teams/AGENTS.md`.
