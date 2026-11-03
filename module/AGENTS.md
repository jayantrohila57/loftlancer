# Module (`module/`)

**Codex:** this file layers on root [AGENTS.md](../AGENTS.md). **Cursor:** [.cursor/rules/agent-workflow.mdc](../.cursor/rules/agent-workflow.mdc).

## Before any edit

1. Read **`module/<domain>/README.md`** for the domain you touch ([README.template.md](./README.template.md) for new domains).
2. Work a **single sub-issue**; plan in chat if the slice spans utils + server + oRPC + client.
3. **Reference code:** `module/<domain>/`, `module/shared/` — not `apps/studio/src/module/*` or `packages/orpc/src/modules/*`.

## Forbidden (mechanical + policy)

- New product logic outside `module/<domain>/`
- New tRPC; oRPC `.input(z.unknown())`; controllers without **`serviceResponseSchema(...).parse`**
- Finishing with **new** `pnpm audit:module-architecture` violations
- Copying legacy Studio/API modules as implementation templates

## Blocked dependency

Stop; add **`## TODO (blocked)`** in the domain README. Do not bridge with app-layer hacks.

## Verify

```bash
pnpm audit:module-architecture
pnpm check-types
```

Before PR to **`dev`**: **`pnpm verify:dev-merge`**.
