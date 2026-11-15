# Features — package.json and public API

**Previous:** [tree-and-scaffold.md](./tree-and-scaffold.md)  
**Next:** [new-feature.md](./new-feature.md)

## package.json baseline

- `"name": "@features/<slug>"`, `"private": true`, `"type": "module"`.
- `"exports": { ".": "./src/index.ts" }` — single default entry.
- **MAY** add subpaths only if listed in a capability **`AGENTS.md`** (e.g. `i18n/AGENTS.md`).
- `"scripts": { "typecheck": "tsc --noEmit" }`.
- **MUST NOT** add `./client` / `./server` package exports in features.
- **MUST NOT** create dependency cycles.

## `@features/i18n`

See [../i18n/AGENTS.md](../i18n/AGENTS.md). Main `.` export **MUST** stay server-safe.

## Public API

- Re-export only intentional symbols from `src/index.ts`.
- Consumers **MUST** import `@features/<slug>` unless a documented subpath exists.

## Config vs types

- Validation in `config/<slug>.config.ts`; **`process.env` ONLY** there.
- **MUST NOT** duplicate enums or env shapes in `types/`.
- Fail fast when required config/env is missing or invalid.

## Env and secrets

- Secrets **MUST NOT** appear in `constants/`, `capability/`, or committed files.

## Code quality

- **MUST NOT** use explicit **`any`** — [../../packages/typescript-config/README.md](../../packages/typescript-config/README.md).
- Implementation in **`capability/`** — **MUST NOT** scatter feature logic in `utils/` or `config/`.
- **No vendor SDKs** in `features/` — use `@packages/*` public APIs.
- Named prop **`interface`** / **`type`** — **MUST NOT** inline object types on public signatures.

## Workspace

- `features/<slug>/` via pnpm `features/*`.
- Consumers add `"@features/<slug>": "workspace:*"` when first used.
