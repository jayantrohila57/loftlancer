# Modules — tree and scaffold

**Previous:** [purpose-and-layer.md](./purpose-and-layer.md)  
**Next:** [wiring.md](./wiring.md)

```text
modules/<slug>/src/
├── server/
│   ├── <slug>.router.ts
│   ├── <slug>.controller.ts
│   ├── services/
│   └── repositories/
├── client/
│   ├── hooks/
│   └── components/
├── utils/
│   ├── config/
│   ├── constants/
│   ├── types/
│   └── validation/
└── index.ts
```

Create only the layers the module needs. Each capability belongs to a standalone module; **do not create nested domain or submodule folders inside a module**. Use `<slug>.` filename prefixes except `index.ts`. Export the module's public API through `src/index.ts`; apps and sibling modules should consume public exports. Environment and SDK dependencies must stay on the appropriate server boundary.

## UI and i18n

- **Domain screens and account leaves** belong in **`client/components/`** (see [organism-components.md](./organism-components.md)); apps re-export from routes only.
- **Generic organisms** (tables, form kits, shell chrome) stay in **`@features/*`**; **multi-app account chrome** in **`@modules/shell`** (`ShellAccountLoading`, frames, nav configs).
- **MUST NOT** add message catalogs or next-intl wiring under modules — app `src/shared/i18n/` per **`features/i18n/AGENTS.md`**.
- Module TSX with Tailwind: scanned via `@source "../../../../../modules/**/*.{ts,tsx}";` in `@packages/ui` **`globals.css`** — **MUST** stay.

## Scaffold lifecycle

Do not add empty scaffold folders or placeholder files.

## Rules

1. One domain per slug.
2. Prefix files with `<slug>.`; `index.ts` excepted.
3. **MUST NOT** add `package.json` under module slug (current conventions).
4. **MUST NOT** modify unrelated modules when changing one slug.

**Next:** [wiring.md](./wiring.md)
