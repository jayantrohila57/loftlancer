# Gap: imports and paths

**Purpose:** Agents default to `@/utils/trpc`, deep relative paths, or duplicate clients. **Always** use the aliases below for new code.

Full tsconfig blocks: [tooling.md](../tooling.md).

---

## Required aliases

| Alias | Resolves to | Use for |
|-------|-------------|---------|
| `@module/*` | `module/*` (repo root) | All product server/client/utils under `module/` |
| `@/*` | `apps/<app>/src/*` | App-only shells (thin pages, `lib/orpc` re-export) |

**Forbidden for domain code:** importing `module/teams/...` via `../../../module/...` from apps — use `@module/teams/...`.

---

## oRPC client (browser / client components)

**Single entry per app** — do not import `@loftlancer/api` routers from feature hooks directly.

| App | Import from | Exports |
|-----|-------------|---------|
| Studio | `@/lib/orpc` (or `@/lib/studio-orpc`) | Typed `studioORPC`, query utils |
| Auth (account) | `@/lib/orpc` | Typed `accountORPC` |

App `lib/orpc.ts` re-exports the generated client from `@loftlancer/api` / `@orpc/client` wiring. Feature hooks import **only** `@/lib/orpc`.

---

## Toast and response UI

| Need | Import |
|------|--------|
| Map ServiceResponse → toast | `@module/shared/client/apply-response-toast` |
| Map ServiceResponse → boundary props | `@module/shared/utils/state/utils.response-to-ui.mapper` |

Do not call `toast.success` / `toast.error` directly in feature hooks except through **`applyResponseToast`** (or documented skip flag).

---

## Permissions (client)

| Need | Import |
|------|--------|
| Gate UI | `useCan(actionId)` / `<Can action={}>` from platform UI package (same registry ID as server) |
| Pre-click analytics | `@module/shared/client/track-action-intent` |

**Forbidden:** `if (role === "admin")` in feature components for gating mutations.

---

## Server (module)

| Need | Import |
|------|--------|
| ServiceResponse factories + schema | `@module/shared/utils/validation/utils.service-response.validation` |
| Types only | `@module/shared/utils/types/utils.service-response.types` |
| Mutations | `@module/shared/server/run-action` |
| Events | `@module/shared/server/events/emit-action-event` |
| Action IDs | `@loftlancer/actions` (`ActionName`, registry) |

Platform only (not domain):

| Need | Import |
|------|--------|
| DB | `@loftlancer/db` |
| Auth session in oRPC context | `@loftlancer/api` context helpers (procedures shell only) |

---

## Typecheck

`module/**` must be included in app and/or root `check-types` (see [tooling.md](../tooling.md)). Do not add domain packages under `packages/` for imports.

---

## Related

- [orpc-transport.md](./orpc-transport.md) — procedure file locations  
- [forbidden-defaults.md](./forbidden-defaults.md) — no domain packages  
