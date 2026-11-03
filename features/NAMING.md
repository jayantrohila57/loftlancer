## Naming and layout

Cross-cutting features mirror **package** naming: **`<feature>.<purpose>.<suffix>`** (kebab-case feature folder as prefix).

| Suffix / file                  | Role                             |
| ------------------------------ | -------------------------------- |
| `.config.ts`                   | Env / wiring                     |
| `.constants.ts`                | Static registries                |
| `.types.ts`                    | Types only                       |
| `.utils.ts`                    | Pure helpers                     |
| `.service.ts` / server modules | Server behavior (`core/server/`) |
| `.hook.ts`                     | Client hooks (`core/client/`)    |
| `.test.ts`                     | Tests (`tests/`)                 |
| `index.ts`                     | Public barrels (unchanged)       |

```text
features/<feature>/
├── src/
│   ├── core/client/     # React UI
│   ├── core/server/     # Server-only
│   ├── config/ constants/ types/ utils/
│   └── index.ts         # optional package root barrel
├── tests/
├── package.json
└── tsconfig.json
```

**Imports:** `@features/<feature>/<path>` → `features/<feature>/src/<path>` (see [docs/naming.md](../../docs/naming.md) — feature prefix replaces provider prefix in packages).
