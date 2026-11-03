# analytics feature

## Naming and layout

See [features/NAMING.md](../NAMING.md) (`<feature>.<purpose>.<suffix>` under `src/core/*`, `config/`, `constants/`, `types/`, `utils/`; tests in `tests/`).


Browser analytics consent (GA4 / PostHog). Shared across Studio and docs.

Import via `@features/analytics/core/client`.

## Layout

```text
features/analytics/
├── src/
│   ├── config/          # defaults (policy link, …)
│   ├── constants/       # storage keys
│   ├── types/           # shared TypeScript types
│   ├── utils/           # consent read/write + external store
│   ├── core/
│   │   ├── client/      # hook + banner UI
│   │   └── server/      # reserved (no server surface yet)
│   └── client/          # public barrel → @features/analytics/core/client
├── tests/
├── package.json
└── tsconfig.json
```

File names: `analytics.<purpose>.ts(x)`.

## Boundaries

| Surface                                | Location                          |
| -------------------------------------- | --------------------------------- |
| Consent banner + `useAnalyticsConsent` | `@features/analytics/core/client` |
| Storage key + parsing                  | `constants/`, `utils/`            |

Design-system primitives stay in `@loftlancer/ui`. PostHog/GA wiring stays in apps.

## Verification

```bash
pnpm --filter @loftlancer/features-analytics check-types
pnpm --filter @loftlancer/features-analytics test
```
