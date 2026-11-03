# Features (`features/`)

Layers on root [AGENTS.md](../AGENTS.md). **Cursor:** [.cursor/rules/agent-workflow.mdc](../.cursor/rules/agent-workflow.mdc).

## Before any edit

1. Read **`features/<name>/README.md`** and [features/README.md](./README.md) (dependency rule: modules → features, not reverse).
2. Work a **single sub-issue**; do not import **`@module/*`** from feature code.

## Reference

- **`features/<name>/`**, **`module/shared/`** for ServiceResponse and actions patterns
- Legacy app paths are read-only — not copy templates

## Verify

```bash
pnpm --filter @loftlancer/features-shared check-types
pnpm audit:module-architecture
```
