# Modules — wiring (no package.json)

**Previous:** [tree-and-scaffold.md](./tree-and-scaffold.md)  
**Next:** [new-module.md](./new-module.md)

Modules are **source folders**, not pnpm packages. Configure **two places**:

## 1. Module — `modules/<slug>/tsconfig.json`

- Extend `@packages/typescript-config/react-library.json` or `base.json`.
- `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"noEmit": true`, `"include": ["src"]`.
- Paths for `@modules/<slug>/*`, `@packages/*`, `@features/*`, sibling `@modules/*`.

Add `{ "path": "./modules/<slug>" }` to root **`tsconfig.json`** `references`.

Until a module has its own `package.json`, Turbo may not typecheck it in isolation — rely on app `typecheck` once imported.

## 2. App — path aliases (required)

```json
"@modules/<slug>": ["../../modules/<slug>/src/index.ts"],
"@modules/<slug>/*": ["../../modules/<slug>/src/*"]
```

Under `compilerOptions.paths` in `apps/<app>/tsconfig.json`.

- **No** `"@modules/<slug>": "workspace:*"` in app `package.json`.
- **MUST NOT** add `@modules/*` to `transpilePackages` (workspace package names only).

Run **`pnpm typecheck --filter <app>`** after wiring.

## Cross-layer

- Features **MUST NOT** depend on `@modules/*`; modules **MAY** depend on `@features/*`.
- Modules **MUST NOT** import vendor SDKs directly — [../packages/package-and-api.md](../packages/package-and-api.md).
