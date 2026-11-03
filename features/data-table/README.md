# Data table feature

## Naming and layout

See [features/NAMING.md](../NAMING.md) (`<feature>.<purpose>.<suffix>` under `src/core/*`, `config/`, `constants/`, `types/`, `utils/`; tests in `tests/`).

Generic TanStack table building blocks for product screens.

**Imports:** `@features/data-table/core/client/*` and `@features/data-table/types/*` (maps to `features/data-table/src/`).

Workspace package: **`@loftlancer/features-data-table`** (`package.json`).

## Directory map

```text
features/data-table/src/
├── types/
│   └── data-table.empty.types.ts
└── core/client/
    ├── data-table.table.tsx
    ├── data-table.toolbar.tsx
    ├── data-table.pagination.tsx
    ├── data-table.column-header.tsx
    ├── data-table.row-actions.tsx
    ├── data-table.actions-column.tsx
    ├── data-table.empty.tsx
    ├── data-table.resolve-empty.tsx
    ├── data-table.skeleton-body.tsx
    └── index.ts
```

## Verification

```bash
pnpm --filter @loftlancer/features-data-table check-types
```
