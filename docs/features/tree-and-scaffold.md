# Features — tree and scaffold

**Router:** [../AGENTS.md](../AGENTS.md)

**Purpose:** Reusable, **domain-independent** functionality — one capability per folder. **Import:** `@features/<slug>`.

## Scope

- **One capability per feature**; folder name **MUST** be the **slug**.
- **MUST NOT** embed product workflows, permissions, or app-specific routes.
- **MUST NOT** initialize vendor SDKs or store secrets — use `@packages/*`.
- **MAY** depend on `@packages/*` and other `@features/*`; **MUST NOT** depend on apps or `@modules/*`.

## Canonical tree

```text
features/
└── <slug>/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── capability/
        ├── config/
        ├── constants/
        ├── types/
        ├── utils/
        └── index.ts
```

**Full scaffold always:** `capability/`, `config/`, `constants/`, `types/`, `utils/`, `index.ts`. Empty dirs **MUST** use `.gitkeep` until implementation exists.

## Folder roles

| Path          | Role                                                      |
| ------------- | --------------------------------------------------------- |
| `capability/` | Implementation; **MUST** use `<slug>.`-prefixed filenames |
| `config/`     | Options + env; **ONLY** `process.env` here                |
| `constants/`  | Static non-secret literals                                |
| `types/`      | Public types; **SHOULD** infer from `config/`             |
| `utils/`      | Pure helpers; no I/O, no SDKs                             |

## Scaffold lifecycle

1. **Create:** full tree; `.gitkeep` in empty dirs.
2. **Fill:** remove `.gitkeep` when the first real file lands.
3. **MUST NOT** add `export {}` stubs unless `typecheck` fails without them.

## Rules (quick)

1. One capability per slug; slug = folder name.
2. Prefix every file with `<slug>.` except `index.ts`.
3. `"@features/<slug>/*": ["./src/*"]` in tsconfig.
4. Default export `@features/<slug>` matching `"exports"."."`.
5. **MUST NOT** modify unrelated features when changing one slug.

**Next:** [package-and-api.md](./package-and-api.md)
