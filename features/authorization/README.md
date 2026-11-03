# authorization feature

RBAC, action registry, permission evaluation, audit writes, and policy checks for modules.

**Package:** `@loftlancer/features-authorization`

## Naming and layout

See [features/NAMING.md](../NAMING.md). Files use the **`authorization.<purpose>.<suffix>`** pattern under `src/{core/server,core/client,config,constants,types,utils}/`; tests in **`tests/`**.

## Canonical imports

| Surface                                                     | Import                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Registry, evaluate, roles, matrices, MCP, nav/apps (barrel) | `@features/authorization/utils`                                                     |
| Nav, apps, Better Auth AC                                   | `@features/authorization/config/authorization.nav` (etc.)                           |
| Server enforcement                                          | `@features/authorization/core/server/authorization.require-action` (etc.)           |
| Page action guard                                           | `@features/authorization/core/server/page-guards/authorization.require-page-action` |
| Client helpers (scaffold)                                   | `@features/authorization/core/client`                                               |

Allowlisted packages may still use `@loftlancer/actions` → same registry types.

## Directory map

```text
features/authorization/
├── package.json
├── tsconfig.json
├── tests/
└── src/
    ├── index.ts
    ├── constants/   # authorization.registry*, matrices, grants, MCP
    ├── config/      # apps, nav, feature, better-auth-ac
    ├── types/
    ├── utils/       # evaluate, org-roles, format-action-label, …
    └── core/
        ├── server/  # requireAction, runAction, audit, guards
        └── client/
```

## Verification

```bash
pnpm --filter @loftlancer/features-authorization check-types
pnpm --filter @loftlancer/features-authorization test
pnpm audit:architecture-layers
```

See [features/README.md](../README.md).
