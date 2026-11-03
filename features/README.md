# Features layer

Cross-cutting product capabilities live here: `features/<name>/{server,client,shared}/`. Features are **reused by multiple modules**; they are not org-scoped product domains.

## Layers (dependency direction)

| Layer | Path | Role |
|-------|------|------|
| **Apps** | `apps/*` | Routes, layouts, thin re-exports — no domain logic |
| **Modules** | `module/<domain>/` | Product domains (teams, organizations, …) |
| **Features** | `features/<name>/` | Shared capabilities (authz, audit, tables, forms, …) |
| **Packages** | `packages/*` | Platform infra (db, ui, api shell, actions registry, …) |

**Dependency rule (mandatory):**

- **Modules may import features** (`@features/*`).
- **Features must not import modules** (`@module/*`). Features may use **packages** and other **features** (prefer acyclic imports).
- **Packages must not import features or modules** (platform stays below product).

```
Apps → Modules → Features → Packages
```

Per-feature runbooks: **`features/<name>/README.md`** ([README.template.md](./README.template.md)).

**Platform rules:** [docs/modules.md](../docs/modules.md) · [docs/naming.md](../docs/naming.md) · [docs/tooling.md](../docs/tooling.md)

## Workspace package

**`features/package.json`** (`@loftlancer/features-shared`) mirrors **`module/package.json`**: shared dependencies and **`pnpm check-types`** over feature sources without booting an app.

Path alias: **`@features/*`** → **`features/*`** (see root and app tsconfigs).

## Verification

```bash
pnpm --filter @loftlancer/features-shared check-types
pnpm audit:module-architecture   # module/ + oRPC only today — see docs/tooling.md
```

Before merging architecture work to **`dev`**: **`pnpm verify:dev-merge`**.

## Initial features (scaffold)

| Feature | Purpose |
|---------|---------|
| [authorization](./authorization/) | RBAC/ABAC, `@loftlancer/actions` registry consumption |
| [audit](./audit/) | Action audit trail UI/helpers |
| [notifications](./notifications/) | In-app notification delivery patterns |
| [forms](./forms/) | Shared form primitives and validation wiring |
| [data-table](./data-table/) | TanStack table patterns, filters, list UX |

Code migration from `module/` or legacy app paths is tracked in GitHub issues — this tree is **scaffold + wiring only** until those land.
