# authentication feature

## Naming and layout

See [features/NAMING.md](../NAMING.md) (`<feature>.<purpose>.<suffix>` under `src/core/*`, `config/`, `constants/`, `types/`, `utils/`; tests in `tests/`).

Session helpers and **Next.js page guard shell** (forbidden/not-found mapping, `runPageGuard`). Action enforcement for pages lives in **`@features/authorization/core/server/page-guards/authorization.require-page-action`**.

Import via **`@features/authentication/core/server/*`**, **`@features/authentication/core/client`**, or **`@features/authentication/utils/*`**. Package: **`@loftlancer/features-authentication`**.

## Layout

```text
features/authentication/
├── src/
│   ├── core/server/     # authentication.* server modules
│   ├── core/client/     # authentication.* client components
│   ├── config/          # platform URL resolution
│   ├── constants/       # default platform URLs
│   ├── types/           # shared types
│   ├── utils/           # auth links, platform sign-out
│   └── index.ts
├── tests/
├── package.json
└── tsconfig.json
```

## Boundaries (feat/architecture-layers)

| Surface                                                                          | Location                                                                                   |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `PageForbiddenError`, `PageNotFoundError`, `runPageGuard`, `applyPageGuardError` | `src/core/server/authentication.page-guard-*.ts`                                           |
| Org invitation email, auth-lifecycle audit, member-access cleanup                | `src/core/server/authentication.*` (+ `authentication.register-better-auth-product-hooks`) |
| Better Auth server wiring                                                        | `@loftlancer/better-auth`                                                                  |
| Better Auth React client factory                                                 | `@loftlancer/better-auth/client`                                                           |
| Impersonation banner, Auth-5 layout, sign-in options                             | `src/core/client/authentication.*`                                                         |
| Auth URL helpers, platform sign-out                                              | `src/utils/authentication.auth-links.ts`, `authentication.platform-sign-out.ts`            |
| Member-removal policy                                                            | `module/organizations/utils/utils.member-removal-policy.ts`                                |

`@loftlancer/orpc/page-guards` re-exports authentication + authorization + module support guards for legacy app `@/lib/page-guards` importers.

## Verify

```bash
pnpm --filter @loftlancer/features-authentication check-types
pnpm --filter @loftlancer/features-authentication test
pnpm --filter @loftlancer/features-shared check-types
```

See [features/README.md](../README.md).
