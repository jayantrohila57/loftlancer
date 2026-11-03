# Patterns feature

## Naming and layout

See [features/NAMING.md](../NAMING.md) (`<feature>.<purpose>.<suffix>` under `src/core/*`, `config/`, `constants/`, `types/`, `utils/`; tests in `tests/`).

Reusable UI patterns (dialogs, page headers, settings chrome, hooks) built on `@loftlancer/ui` primitives.

Import via **`@features/patterns/core/client/*`**, **`@features/patterns/utils/patterns.*.utils`**, and **`@features/patterns/config/patterns.*.config`**.

## Layout

```text
features/patterns/
├── src/
│   ├── core/
│   │   ├── client/       # patterns.<component>.tsx, patterns.use-*.hook.ts
│   │   └── server/       # reserved (index barrel)
│   ├── config/           # fonts, segmented control, settings tabs
│   ├── utils/            # patterns.<topic>.utils.ts
│   └── index.ts
├── tests/
├── package.json
└── tsconfig.json
```

## Verification

```bash
pnpm --filter @loftlancer/features-patterns check-types
pnpm --filter @loftlancer/features-patterns test
```
