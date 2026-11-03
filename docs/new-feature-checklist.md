# New feature checklist

Ordered steps for adding or extending a **product feature** under `module/<feature>/`.

**Read first:** **`module/<feature>/README.md`** (create from [module/README.template.md](../module/README.template.md)). Platform index: [architecture-gaps.md](./architecture-gaps.md), [modules.md](./modules.md). Directory tree reference: [reference-module-teams.md](./reference-module-teams.md) (structure only — live runbook stays in `module/teams/README.md`).

**Agents:** implement **one sub-issue** at a time; plan before code if scope spans multiple sections below ([agent-workflow.mdc](../.cursor/rules/agent-workflow.mdc)).

---

## 0. Plan (before code)

- [ ] Sub-issue (or scoped issue) acceptance criteria clear; parent issue linked if applicable.
- [ ] **`module/<feature>/README.md`** read; update **TODO (blocked)** if stopping on a dependency.
- [ ] Short ordered plan in chat when scope spans multiple sections below (required for small/fast models).

---

## 1. Product and access

- [ ] Work tied to an open GitHub **sub-issue** ([AGENTS.md](../AGENTS.md)).
- [ ] Add or update action row in `features/authorization/src/constants/authorization.registry-data.ts` (`name`, `scope`, roles, audit entity, optional `notifyOn`).
- [ ] Read [access-control.md](./access-control.md) for scope and ABAC attributes.

---

## 2. Module scaffold

- [ ] Create `module/<feature>/{utils,server,client}` per [modules.md](./modules.md) and [naming.md](./naming.md).
- [ ] Add `client/studio/layout/client.section.layout.tsx` if Studio section has multiple routes ([layouts.md](./layouts.md)).
- [ ] Add `client/config/client.routes.ts` ([gaps/layouts-routes.md](./gaps/layouts-routes.md)).

---

## 3. Utils

- [ ] Input/output Zod in `utils/validation/utils.<operation>.validation.ts`.
- [ ] Query keys in `utils/constants/utils.query-keys.constants.ts` if client refetch ([naming.md](./naming.md)).

---

## 4. Server

- [ ] Service in `server/service/server.<operation>.service.ts` → **`ServiceOutcome`** ([gaps/contracts.md](./gaps/contracts.md)).
- [ ] Controller in `server/controller/server.<operation>.controller.ts` → **`runAction`** for mutations ([gaps/actions-audit.md](./gaps/actions-audit.md)).
- [ ] RSC loader in `server/page/server.<screen>.page.ts` when needed ([gaps/server-folders.md](./gaps/server-folders.md)).
- [ ] Handlers/actions only when oRPC is not the transport ([server-api.md](./server-api.md)).

---

## 5. Transport

- [ ] oRPC procedure in `packages/orpc/src/orpc/procedures/<feature>.ts` → controller only ([gaps/orpc-transport.md](./gaps/orpc-transport.md)).
- [ ] **No new tRPC** ([gaps/forbidden-defaults.md](./gaps/forbidden-defaults.md)).
- [ ] MCP tool maps to same controller + ServiceResponse if exposed.

---

## 6. Client

- [ ] Read [ui-ux-skills.md](./ui-ux-skills.md) — at minimum **shadcn**, **coss**, **ui-ux-pro-max** before UI code; **coss-particles** when searching patterns.
- [ ] Hooks: `client/hooks/client.use-<feature>-<operation>.hook.ts` + `@/lib/orpc` ([gaps/imports-paths.md](./gaps/imports-paths.md)).
- [ ] **`applyResponseToast`** on mutations.
- [ ] **`client.<screen>.boundary.tsx`** + **`client.<screen>.content.tsx`** ([rendering.md](./rendering.md)).
- [ ] Client leaves via **`dynamic()`** + skeleton ([gaps/client-layer.md](./gaps/client-layer.md)).
- [ ] **`useCan` / `<Can>`** + **`trackActionIntent`** on mutation buttons.
- [ ] Pre-merge UI pass: **web-design-guidelines** or **ui-ux-pro-max** pro-rules.

---

## 7. App routes (thin)

- [ ] `apps/studio/src/app/.../page.tsx` imports `@module/<feature>/...` only — no domain logic ([gaps/forbidden-defaults.md](./gaps/forbidden-defaults.md)).
- [ ] `loading.tsx` / `error.tsx` / `not-found.tsx` / `forbidden.tsx` per [app-states.md](./app-states.md).

---

## 8. Verify (mechanical)

- [ ] **`pnpm audit:module-architecture`** — zero **new** violations ([tooling.md](./tooling.md)).
- [ ] **`pnpm check-types`** and relevant **`pnpm test`** / feature tests.
- [ ] Before PR to **`dev`**: **`pnpm verify:dev-merge`** on the full issue branch.

---

## 9. Ship

- [ ] **`module/<feature>/README.md`** updated (boundaries, verification, sub-issues table, TODOs).

- [ ] [CHANGELOG.md](../CHANGELOG.md) under `[Unreleased]` when merged to `dev`.
- [ ] Commit footer `Fixes #<issue>` when completing issue work.

---

## Related

- [product.md](./product.md) — permission recipe
- [data-workflow.md](./data-workflow.md) — ServiceResponse UI
