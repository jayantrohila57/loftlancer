# Apps — package.json and TypeScript

**Previous:** [conventions.md](./conventions.md)  
**Next:** [new-app-checklist.md](./new-app-checklist.md)

## package.json

- `"name"` = folder slug; `"private": true`; `"type": "module"`.
- Scripts: `dev`, `build`, `start`, `typecheck`.
- **MAY** add `"@features/<slug>": "workspace:*"` / `"@packages/<slug>": "workspace:*"` when used.

## tsconfig

- **extends** `@packages/typescript-config/nextjs.json`.
- Paths for `@/*`, `@/shared/*`, and each used feature/module.
- Add `{ "path": "./apps/<name>" }` to root **`tsconfig.json`** `references` when adding an app.

## Dependencies

- Prefer owning features for vendor libs.
- Apps **MAY** add a peer-style dep only when a feature README requires it (e.g. typed next-intl shims).

TypeScript policy: [../../packages/typescript-config/README.md](../../packages/typescript-config/README.md).
