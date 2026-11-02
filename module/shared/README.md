# Shared module (`module/shared/`)

Cross-feature **product** helpers used by more than one domain module. Not platform infra (that stays in `packages/`).

```text
module/shared/
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

Typecheck: `pnpm --filter @loftlancer/module-shared check-types`.
