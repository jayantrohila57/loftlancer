# observability feature

## Naming and layout

See [features/NAMING.md](../NAMING.md) (`<feature>.<purpose>.<suffix>` under `src/core/*`, `config/`, `constants/`, `types/`, `utils/`; tests in `tests/`).


Shared Sentry test-error panel used by Studio, Auth, and docs apps.

Import via `@features/observability/core/client`.

Sentry SDK init lives in `@loftlancer/sentry`.

## Layout

```text
features/observability/
├── src/
│   ├── types/           # SentryTestResult
│   ├── core/
│   │   ├── client/      # Sentry test panel UI
│   │   └── server/      # reserved (no server surface yet)
│   └── client/          # public barrel → @features/observability/core/client
├── package.json
└── tsconfig.json
```

File names: `observability.<purpose>.ts(x)`.

## Verification

```bash
pnpm --filter @loftlancer/features-observability check-types
```
