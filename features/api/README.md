# api feature

## Naming and layout

See [features/NAMING.md](../NAMING.md) (`<feature>.<purpose>.<suffix>` under `src/core/*`, `config/`, `constants/`, `types/`, `utils/`; tests in `tests/`).


Shared procedure middleware and **client-safe error normalization** reused by `@packages/orpc` transport.

Import `@features/api/utils/api.friendly-error.utils` for tRPC/oRPC error formatting.

## Layout

```text
features/api/
├── src/
│   ├── core/server/     # api.middleware.ts, api.procedures.ts (scaffold)
│   ├── utils/           # api.friendly-error.utils.ts
│   └── index.ts
├── tests/
├── package.json         # @loftlancer/features-api
└── tsconfig.json
```

File names: `api.<purpose>.ts`.

## Boundaries

| Surface                                    | Import                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| Friendly tRPC/oRPC errors                  | `@features/api/utils/api.friendly-error.utils`                                 |
| Future shared middleware / procedure shell | `@features/api/core/server/middleware`, `@features/api/core/server/procedures` |

Transport procedure wiring stays in `@packages/orpc` until middleware moves here ([docs/features.md](../../docs/features.md) allowlist).

## Moved (feat/architecture-layers)

| From                          | To                                      |
| ----------------------------- | --------------------------------------- |
| `packages/orpc/src/errors.ts` | `src/utils/api.friendly-error.utils.ts` |

`tRPC`/`oRPC` procedure shells remain in `@packages/orpc` until middleware moves here.

## Verification

```bash
pnpm --filter @loftlancer/features-api check-types
pnpm --filter @loftlancer/features-shared check-types
pnpm --filter @loftlancer/orpc exec tsc --noEmit
```

See [features/README.md](../README.md).
