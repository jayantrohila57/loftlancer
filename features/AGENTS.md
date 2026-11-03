# Features (`features/`)

Layers on root [AGENTS.md](../AGENTS.md). **Cursor:** [.cursor/rules/agent-workflow.mdc](../.cursor/rules/agent-workflow.mdc).

## Before any edit

1. Read **`features/<name>/README.md`** and [features/README.md](./README.md) (dependency rule: modules → features, not reverse).
2. Work a **single sub-issue**; do not import **`@modules/*`** or **`@module/*`** from feature code.

## Features

`api`, `authentication`, and `authorization`. Sources live in **`features/<feature>/src/`**. Import **`@features/<feature>/<rest>`** (no `src` in the path).

## Reference

- **`features/<feature>/src/`**, **`module/shared/`** for ServiceResponse and actions patterns
- Legacy app paths are read-only — not copy templates

## Verify

```bash
pnpm check-types
pnpm audit:module-architecture
```
