# shell feature

## Naming and layout

See [features/NAMING.md](../NAMING.md) (`<feature>.<purpose>.<suffix>` under `src/core/*`, `config/`, `constants/`, `types/`, `utils/`; tests in `tests/`).

Loftlancer dashboard / public app chrome (sidebar shell, page header bar).

Import via **`@features/shell/core/client`** and **`@features/shell/utils/shell.*.utils`**.

## Layout

```text
features/shell/
├── src/
│   ├── core/client/   # shell.*.tsx
│   ├── utils/         # shell.*.utils.ts (routes, URLs, layout spacing, status)
│   └── index.ts
├── tests/
├── package.json
└── tsconfig.json
```

Primitives (`Sidebar`, `Separator`, …) remain in `@loftlancer/ui`.

## Verification

```bash
pnpm --filter @loftlancer/features-shell check-types
pnpm --filter @loftlancer/features-shell test
```
