# `@loftlancer/api` (Codex scope)

Layers on root [AGENTS.md](../../AGENTS.md) and [module/AGENTS.md](../../module/AGENTS.md).

## Greenfield product code

- **New domain behavior:** `module/<domain>/server` + thin wiring in **`src/orpc/procedures/`** only.
- **Do not** add product services under **`src/modules/<domain>/`** (legacy; read-only compat).
- Procedures must import **`@module/*`** schemas/controllers — no **`z.unknown()`** / **`teamControllerInputSchema`**.

## Legacy transport

- **`src/routers/`** (tRPC) and **`src/mcp/`** may call module controllers + **`unwrapTeam*`** only in allowlisted adapter paths.

## Verify after oRPC / router edits

```bash
pnpm audit:module-architecture
pnpm check-types
```
