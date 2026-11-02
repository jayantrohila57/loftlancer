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

## Related

- [architecture-gaps.md](./architecture-gaps.md)  
- [modules.md](./modules.md)  
