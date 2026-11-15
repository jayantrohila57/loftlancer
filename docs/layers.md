# Layer roles (read once)

| Path        | Role                                                                          | Import                       |
| ----------- | ----------------------------------------------------------------------------- | ---------------------------- |
| `packages/` | SDK / shared library                                                          | `@packages/<slug>` workspace |
| `features/` | Reusable **organisms** (forms, tables, RBAC patterns) — not product workflows | `@features/<slug>` workspace |
| `modules/`  | **Product domain** (users, teams, billing) + API/orpc stack                   | `@modules/<slug>` app paths  |
| `apps/`     | **Routing shell** only — render module exports                                | `@/` + aliases               |

**Order:** `packages` / `features` / `modules` first, then app routes.

**Edges:** apps ↛ libraries as owners; features ↛ modules; SDK init only in `packages/`.

Detail: [workflow/01-classify.md](./workflow/01-classify.md).
