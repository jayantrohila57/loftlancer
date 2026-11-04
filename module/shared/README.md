# Shared module (`module/shared/`)

Cross-feature **product** helpers used by more than one domain module. Not platform infra (that stays in `packages/`).

```text
module/shared/
├── layout/
│   ├── header/       # reusable application headers
│   └── footer/       # reusable application footers
├── utils/
│   ├── types/          # *.types.ts
│   ├── validation/     # *.validation.ts
│   └── state/          # *.mapper.ts
├── server/
│   ├── run-action.ts
│   └── events/emit-action-event.ts
└── client/
    ├── apply-response-toast.ts
    └── track-action-intent.ts
```

**Naming:** [docs/naming.md](../docs/naming.md) · **Specs:** [docs/data-workflow.md](../docs/data-workflow.md)

Prefer **`module/<feature>/`** when only one domain needs the code. See [docs/server-api.md](../docs/server-api.md).

Shared layouts are cross-application building blocks. Each app or domain composes them with its own brand, navigation, and actions; app-specific content stays with its owning module.

Typecheck: `pnpm --filter @loftlancer/module-shared check-types`.
