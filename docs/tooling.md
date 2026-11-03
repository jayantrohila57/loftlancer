# Tooling: `module/` paths and typecheck

**Purpose:** Configure monorepo so `@module/*` resolves everywhere new product code runs. Agents must not rely on undocumented relative paths.

See: [gaps/imports-paths.md](./gaps/imports-paths.md), [modules.md](./modules.md).

---

## Path alias `@module/*`

Map **`@module/*`** → **`../../module/*`** from each app (adjust depth if app path differs).

### Studio (`apps/studio/tsconfig.json`)

Add under `compilerOptions.paths`:

```json
{
  "@/*": ["./src/*"],
  "@module/*": ["../../module/*"]
}
```

Include module sources in `include` when TypeScript must resolve cross-root imports:

```json
"include": [
  "./**/*.ts",
  "./**/*.tsx",
  "../../module/**/*.ts",
  "../../module/**/*.tsx"
]
```

### Auth (`apps/auth/tsconfig.json`)

Same **`@module/*`** mapping as Studio.

### Packages API (`packages/api/tsconfig.json`)

Add **`@module/*`** so procedure files import controllers:

```json
"@module/*": ["../../module/*"]
```

---

## App oRPC client re-export

Create **`apps/studio/src/lib/orpc.ts`** (and auth equivalent):

- Re-export typed client used by all **`module/.../client/hooks`**.
- Feature code imports **`@/lib/orpc`** only — not `@loftlancer/api` internals.

Document the exact export names in this file when wired (`studioORPC`, `accountORPC`).

---

## Module package typecheck (optional root)

**`module/package.json`** + **`module/tsconfig.json`** can run **`pnpm check-types`** over shared contracts without an app:

- Depends on `zod`, `@loftlancer/actions` (types for `ActionName`).
- Extends `@loftlancer/config/tsconfig.base.json`.
- `"paths": { "@module/*": ["./*"] }`

Root **`pnpm check-types`** should include **`module`** when the package exists (turbo task).

---

## Turbo

When `module/package.json` exists, register **`check-types`** in turbo pipeline so CI validates shared stubs and future implementations.

---

## Module architecture audit (CI gate)

**`pnpm audit:module-architecture`** runs **`scripts/audit-module-architecture.mjs`**. It enforces prescriptive gaps mechanically (not honor-system for agents):

| Rule | What it checks |
|------|----------------|
| `controller-response-schema` | Every `module/*/server/controller/*.controller.ts` returns **`serviceResponseSchema(...).parse(...)`** |
| `orpc-input-schema` | No **`z.unknown()`** or **`teamControllerInputSchema`** in `packages/api/src/orpc/procedures/` |
| `orpc-module-import` | Procedures import controllers/schemas from **`@module/*`** |
| `legacy-unwrap` | **`unwrapTeam*`** only in allowlisted tRPC/MCP/legacy handler paths |
| `app-page-forbidden` / `app-page-thin` | Studio (and other) **`page.tsx`**: no DB/`requireAction`; teams routes stay thin **`@module`** re-exports |

**Baseline:** Known debt is listed in **`scripts/audit-module-architecture-baseline.json`**. CI **fails on NEW violation ids** only. After fixing code, shrink the baseline:

```bash
node scripts/audit-module-architecture.mjs --write-baseline
```

**Strict (local / burn-down):** **`node scripts/audit-module-architecture.mjs --strict`** fails on any violation.

CI runs this on every push to **`dev`** and **`main`** and on pull requests ([forbidden-defaults.md](./gaps/forbidden-defaults.md)).

**Before merging an issue branch to `dev`:** **`pnpm verify:dev-merge`** (lint, routes, audit, types, tests). Agent workflow: [AGENTS.md](../AGENTS.md), `.cursor/rules/agent-workflow.mdc`, **[.codex/README.md](../.codex/README.md)** (OpenAI Codex).

---

## Related

- [architecture-gaps.md](./architecture-gaps.md)  
- [modules.md](./modules.md)  
