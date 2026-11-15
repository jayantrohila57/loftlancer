# Packages — tree and scaffold

**Router:** [../AGENTS.md](../AGENTS.md)

**Applies to:** every package under `packages/` (`ui`, `typescript-config`, providers, …).

## Package identity

- **One ownership boundary per package:** one external provider **or** one shared capability.
- Folder name **MUST** be the **slug**.
- **MUST NOT** package single-app features, routes, or product-only logic.

## Canonical tree

```text
packages/
└── <slug>/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── config/
        ├── constants/
        ├── integration/
        ├── types/
        ├── utils/
        └── index.ts
```

Unused folders stay empty with `.gitkeep` until implemented.

## Folder roles

| Path           | Role                                                           |
| -------------- | -------------------------------------------------------------- |
| `integration/` | Main implementation; providers: SDK wiring                     |
| `config/`      | Env + validation; **ONLY** `process.env` here                  |
| `constants/`   | Non-secret static literals                                     |
| `types/`       | Public types; infer from config where possible                 |
| `utils/`       | Pure helpers; no I/O (except provider packages in integration) |

## Scaffold lifecycle

Same as features: create full tree with `.gitkeep`; remove when filled.

## Rules (quick)

1. One boundary per package; slug = folder name.
2. Prefix files `<slug>.<area>.ts`; `index.ts` is the exception.
3. Single public import `@packages/<slug>` matching `"exports"."."`.
4. `"@packages/<slug>/*": ["./src/*"]` in package tsconfig.
5. **MUST NOT** depend on `apps/*`.

**Next:** [package-and-api.md](./package-and-api.md)
