# Features layer

Cross-cutting product capabilities live under **`features/<name>/src/`** (`core/server`, `core/client`, `config/`, `constants/`, `types/`, `utils/` — see [NAMING.md](./NAMING.md)). Features are **reused by multiple modules**; they are not org-scoped product domains.

## Layers (dependency direction)

| Layer        | Path                   | Role                                                              |
| ------------ | ---------------------- | ----------------------------------------------------------------- |
| **Apps**     | `apps/*`               | Routes, layouts, thin re-exports — no domain logic                |
| **Modules**  | `module/<domain>/`     | Product domains (teams, organizations, …)                         |
| **Features** | `features/<name>/src/` | Shared capabilities (api shell, auth, authz, …)                   |
| **Packages** | `packages/*`           | Platform infra (db, ui, api transport, …) — no product registries |

**Dependency rule (mandatory):**

- **Modules may import features** (`@features/*`).
- **Features must not import modules** (`@modules/*` / dual `@module/*`). Features may use **packages** (`@packages/*` or `@loftlancer/*`) and other **features** (prefer acyclic imports).
- **Packages must not import features or modules** (platform stays below product).

```
Apps → Modules → Features → Packages
```

### Import aliases

| Layer    | Alias        | Example                               |
| -------- | ------------ | ------------------------------------- |
| Apps     | `@/`         | `@/app/layout`                        |
| Modules  | `@modules/`  | `@modules/teams/server`               |
| Features | `@features/` | `@features/authorization/core/server` |
| Packages | `@packages/` | `@packages/drizzle`                   |

Path mapping: **`@features/<feature>/<rest>`** → **`features/<feature>/src/<rest>`**. **`@features/*`** still maps to **`features/*`**. Register **`@features/<feature>/*`** before the catch-all ([tooling.md](../docs/tooling.md)).

## Tree

```text
features/
├── api/  authentication/  authorization/  notifications/
├── analytics/  observability/  patterns/  data-table/
├── shell/           # dashboard / public app chrome (from packages/ui)
└── marketing/       # www + docs marketing chrome (from packages/ui)
# Each feature: src/core/{server,client}/ + config|constants|types|utils — see NAMING.md and features/<name>/README.md
```

Per-feature runbooks: **`features/<name>/README.md`** ([README.template.md](./README.template.md)).

**Platform rules:** [docs/modules.md](../docs/modules.md) · [docs/naming.md](../docs/naming.md) · [docs/tooling.md](../docs/tooling.md)

## Workspace packages

Each feature is its own pnpm workspace package (`features/<name>/package.json`, name `@loftlancer/features-<name>`). Shared TypeScript path mappings live in **`features/tsconfig.feature-paths.json`**; each feature extends it from **`features/<name>/tsconfig.json`**.

Dependencies are declared per feature (no root **`features/package.json`**). Typecheck and tests run via Turbo:

```bash
pnpm check-types   # all workspace packages with a check-types script
pnpm --filter @loftlancer/features-authorization test
pnpm audit:architecture-layers
pnpm audit:module-architecture   # module/ + oRPC — see docs/tooling.md
```

Before merging architecture work to **`dev`**: **`pnpm verify:dev-merge`**.

## Features (scaffold)

| Feature                             | Purpose                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| [api](./api/)                       | Future home for oRPC shell (today in `packages/orpc`)                                   |
| [authentication](./authentication/) | Session/better-auth UX (auth-5, sign-in, impersonation) atop `@packages/better-auth`    |
| [authorization](./authorization/)   | RBAC/ABAC, action registry, `requireAction` / `runAction` (`@features/authorization/*`) |
| [notifications](./notifications/)   | In-app + email notification types, preferences, delivery, audit triggers                |
| [analytics](./analytics/)           | Browser analytics consent banner / hook                                                 |
| [observability](./observability/)   | Shared Sentry test-error panel                                                          |
| [shell](./shell/)                   | Dashboard / public app chrome                                                           |
| [marketing](./marketing/)           | Shared marketing landing chrome (www + docs)                                            |

Code migration from `packages/orpc`, legacy app paths, and duplicate module logic is tracked in GitHub issues — this tree is **scaffold + wiring** until those land.
