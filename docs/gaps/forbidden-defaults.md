# Gap: forbidden defaults

**Purpose:** Explicit “do not” list so agents do not create parallel packages, tRPC, or fat app pages.

See: [packages.md](../packages.md), [modules.md](../modules.md).

---

## Domain location

| Forbidden | Required |
|-----------|----------|
| `@loftlancer/teams`, `@loftlancer/projects`, … packages | **`module/<feature>/`** only |
| New `packages/api/src/modules/<domain>` for **new** product logic | **`module/<feature>/server`** + thin oRPC in `packages/api/src/orpc/procedures` |
| Business logic in `apps/*/src/app/**` beyond thin re-exports | **`module/...`** |

---

## RPC protocol

| Forbidden | Required |
|-----------|----------|
| New **tRPC** procedures | **oRPC** + module controllers |
| Client `@trpc/react-query` in new feature hooks | **`@/lib/orpc`** + module hooks |

---

## apps/page.tsx

| Rule | Detail |
|------|--------|
| Max responsibility | Metadata + import module page/loader + render with props |
| Guideline | **~15 lines** or less — no DB, no `requireAction`, no large JSX |
| Allowed imports | `@module/*`, `@/lib/*` platform, Next types |

---

## Server Actions

| Default | Exception |
|---------|-----------|
| **oRPC** for mutations the client refetches | Server Action only for documented cases (form PE, upload) |

---

## Packages/api

**Allowed under `packages/api`:**

- `orpc/` procedures shell, routers, context  
- Platform auth, audit **writers** invoked by `runAction`  
- Tests for transport wiring  

**Forbidden:**

- New domain services/controllers under `packages/api/src/modules/*` for greenfield features  

---

## Tests

| Layer | Location |
|-------|----------|
| Service / controller | `*.test.ts` **next to** source in `module/<feature>/server` |
| ServiceResponse contract | `module/shared/utils/**/*.test.ts` |
| Transport-only | `packages/api/src/orpc/*.test.ts` — no domain assertions without module |

---

## CI (target)

When implemented:

- Fail if new files appear under `packages/api/src/modules/` for product domains (allowlist during migration).  
- Optional: lint app `page.tsx` for forbidden imports (`@loftlancer/db`, `requireAction`).

Document implementation in [agent-meta.md](./agent-meta.md) when added.

---

## Related

- [orpc-transport.md](./orpc-transport.md)  
- [server-folders.md](./server-folders.md)  
