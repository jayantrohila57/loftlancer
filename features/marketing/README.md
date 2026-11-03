# marketing feature

## Naming and layout

See [features/NAMING.md](../NAMING.md) (`<feature>.<purpose>.<suffix>` under `src/core/*`, `config/`, `constants/`, `types/`, `utils/`; tests in `tests/`).


Shared marketing landing / site chrome for `apps/www` and `apps/docs`.

Import via `@features/marketing/core/client` (barrel) or `@features/marketing/constants/marketing.features` for the feature grid data.

## Layout

```text
features/marketing/
  package.json
  tsconfig.json
  src/
    config/           marketing.site-config.ts
    constants/        marketing.features.ts
    core/client/      marketing.shell.tsx, marketing.landing.tsx, marketing.components.tsx
    client/           index.ts (+ features.ts shim for deep imports)
    index.ts
  tests/
```

See [features/README.md](../README.md).
