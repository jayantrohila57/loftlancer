# Apps — canonical tree

**Previous:** [purpose-and-scope.md](./purpose-and-scope.md)  
**Next:** [conventions.md](./conventions.md)

```text
apps/
└── <name>/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── postcss.config.mjs
    ├── components.json
    ├── global.d.ts
    └── src/
        ├── app/                    # all routes under src/app/ (e.g. [lang]/)
        ├── components/             # app-only UI
        ├── shared/
        │   ├── i18n/               # see features/i18n/AGENTS.md
        │   └── types/
        │       └── <slug>.app.types.ts
        └── proxy.ts                # Next 16+ request proxy (not middleware.ts)
```

**MUST** use **`src/`** layout: `src/app/`, `src/components/`, `src/shared/`, `src/proxy.ts`.
