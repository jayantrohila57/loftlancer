# Requirements: Organization roles and RBAC

**Status:** Approved  
**Approved by:** User batch sign-off — **2026-11-14**  
**Date:** 2026-11-14  
**Layers:** packages / features / modules / apps  
**Related:**

| Doc                                                                                            | Relationship                                                                                     |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [organizations.md](./organizations.md)                                                         | **Approved** — membership, invites, active org                                                   |
| [storage-system.md](./storage-system.md)                                                       | **Approved** — owner sole grantor; manager/member grant-scoped                                   |
| [autumn-usage-metering.md](./autumn-usage-metering.md)                                         | **Approved** — billing customer per org; custom billing UI                                       |
| [platform-entitlements-plan.md](../platform-entitlements-plan.md)                              | Enforcement matrix, denial codes                                                                 |
| [better-auth.md](./better-auth.md)                                                             | Identity; platform **admin** ≠ org **owner**                                                     |
| [ai-usage-credits.md](./ai-usage-credits.md)                                                   | **Approved** (v1: gates/model only, no routes) — AI gates use same org context when Studio lands |
| [entitlements-design-answers.md](./entitlements-design-answers.md#organization-roles-and-rbac) | BA vs oRPC enforcement, session revocation, billing read guards, job principals                  |

## Goal

Define **three organization roles** — **owner**, **manager**, and **member** — with one consistent authorization story across oRPC, Better Auth org membership, Account UI, Storage ACL, and Billing. Server code **derives organization and role from the session and membership tables**, never from client-supplied `organizationId` alone.

## Product roles (v1)

| Role        | Better Auth mapping (proposed)                                     | Summary                                                                                       |
| ----------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| **Owner**   | BA org role `owner` (confirm at implement)                         | Full org administration; **sole storage grantor**; **sole billing actor**                     |
| **Manager** | BA org role `admin` or custom `manager` — **confirm at implement** | **Same as member in v1** until owner grants storage; **no invite/remove**; **no billing tab** |
| **Member**  | BA org role `member`                                               | Baseline access; storage only via **owner grants**                                            |

**Platform admin** (`user.role === admin` in Better Auth admin plugin) is **Console-only** and does **not** inherit org owner powers in Account Storage/Billing ([better-auth.md](./better-auth.md), [platform-entitlements-plan.md](../platform-entitlements-plan.md) §4.3).

## Decisions (user input 2026-11-14)

| #                           | Topic                                                                                                                            | Decision |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **R1 — Role set**           | **Owner**, **manager**, **member** at org level (Better Auth organization plugin)                                                |
| **R2 — Storage grantor**    | **Owner only** may create/update/revoke storage grants ([storage-system.md](./storage-system.md) R3)                             |
| **R3 — Billing**            | **Owner only** may upgrade plan, buy credits, open invoice/portal flows ([autumn-usage-metering.md](./autumn-usage-metering.md)) |
| **R4 — Trust model**        | oRPC **must** resolve `organization_id` + role from session + membership; client org id is hint at most                          |
| **R5 — HTTP semantics**     | Wrong role → **403** with stable `rbac.forbidden`; cross-org resource id → **403 Forbidden** (consistent; no 404 disguise)       |
| **R6 — Manager v1**         | Manager powers **same as member** until owner grants storage; **no invite/remove members** in v1                                 |
| **R7 — Billing visibility** | **Billing tab hidden** for non-owners (managers and members); owner-only purchase routes unchanged                               |

## Capabilities matrix (v1)

| Capability                              | Owner                                            | Manager                             | Member               |
| --------------------------------------- | ------------------------------------------------ | ----------------------------------- | -------------------- |
| View org settings / name                | Yes                                              | Read-only (same as member baseline) | Read-only            |
| Invite members                          | Yes                                              | **No (v1)**                         | No                   |
| Remove members / change roles           | Yes                                              | **No (v1)**                         | No                   |
| Transfer ownership                      | Yes                                              | No                                  | No                   |
| Leave organization                      | Blocked until transfer — defer implement         | Yes                                 | Yes                  |
| **Billing:** view plan/usage            | Yes (Billing tab)                                | **Hidden (v1)**                     | **Hidden (v1)**      |
| **Billing:** upgrade / credits / portal | **Yes**                                          | **No** (tab hidden)                 | **No** (tab hidden)  |
| **Storage:** see all org files          | Yes (bypass grants)                              | Only granted                        | Only granted         |
| **Storage:** upload/edit in scope       | All org storage                                  | Granted folders only                | Granted folders only |
| **Storage:** manage grants              | **Yes (sole grantor)**                           | No                                  | No                   |
| **AI invoke** (when enabled)            | Per [ai-usage-credits.md](./ai-usage-credits.md) | Same if entitled                    | Same if entitled     |
| Org avatar upload                       | Yes (owner-only per storage R7)                  | No unless amended                   | No                   |

**Manager vs member (v1):** **Identical** product powers until owner grants storage — same storage ACL (grants only), **no** invite/remove, **no** Billing tab. Reserve manager role for **future** elevated org admin without changing v1 enforcement.

## Storage alignment ([storage-system.md](./storage-system.md))

- **Owner** — read/write entire org tree under default root; **only** role that can call `storage.grants.*`.
- **Manager / member** — identical storage ACL: **no list** in folders without grant; grant implies **view + edit** (storage Q1).
- Quota and upload gates apply equally to all roles with write access in scope.

## Billing alignment ([autumn-usage-metering.md](./autumn-usage-metering.md))

- `@modules/billing` routes and oRPC mutations for **attach**, **credit purchase**, **customer portal** → **`requireOrgRole("owner")`** (or equivalent).
- Non-owners: **Billing tab hidden** in Account shell (managers and members); server rejects purchase mutations with `rbac.forbidden` if invoked directly.
- Sensitive billing actions may require **fresh session** — align with auth-account policy when billing ships (**TBD**).

## UI implications

| Surface                                   | Owner             | Manager               | Member              |
| ----------------------------------------- | ----------------- | --------------------- | ------------------- |
| Account → Billing — upgrade / buy credits | Visible + enabled | Tab **hidden (v1)**   | Tab **hidden (v1)** |
| Account → Billing — usage/plan read       | Full              | Tab **hidden (v1)**   | Tab **hidden (v1)** |
| Account → Storage — grants UI             | Visible           | Hidden                | Hidden              |
| Account → Storage — files                 | Full tree         | Granted only          | Granted only        |
| Org settings — members / invites          | Full              | No invite/remove (v1) | No                  |

Use existing shell patterns; no raw billing primitives in apps — `@modules/billing` only.

## oRPC authorization pattern (normative)

Apply to `@modules/storage`, `@modules/billing`, `@modules/org`, and future AI routers:

1. **`protectedProcedure`** — authenticated user id.
2. **`resolveActiveOrganization(context)`** — from Better Auth session (**active org id**). If missing → `auth.no_active_org` (403 or redirect policy per route).
3. **`loadMembership(userId, organizationId)`** — if not member → `rbac.forbidden` or `rbac.not_member` (**403**).
4. **`requireOrgRole(ctx, { min: "member" })`** or exact role for admin mutations.
5. **Load resource** by id — assert `resource.organization_id === ctx.organizationId`.
6. **Domain policy** — e.g. storage grant check, entitlement check (`quota_bytes`, `ai_enabled`).
7. **Never** use `input.organizationId` as authority unless re-verified against session (prefer omitting from input entirely).

**Middleware placement (proposed):** shared helper in `@modules/security` or `@packages/better-auth` org helpers exported for oRPC; each module composes `protectedProcedure` → `orgProcedure` → role guards.

```typescript
// Illustrative — not implementation
orgProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const { organizationId, role } = await resolveOrgFromSession(ctx.session)
  return next({ ctx: { ...ctx, organizationId, orgRole: role } })
})
```

## Error codes (stable)

Align with [platform-entitlements-plan.md](../platform-entitlements-plan.md) §4.7:

| Code                 | When                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| `auth.no_active_org` | Signed in but no active organization for org-scoped route                        |
| `rbac.forbidden`     | Member of org but role insufficient                                              |
| `rbac.not_member`    | Active org not in user's memberships (session tamper / stale) — **403**          |
| `rbac.cross_org`     | Resource `organization_id` ≠ session active org / membership — **403** (not 404) |

Log `organization_id`, `user_id`, `required_role`, `actual_role` server-side (no secrets).

## In scope (after approval)

- [ ] Document BA role string mapping (owner / manager / member) in `@packages/better-auth` config.
- [ ] Shared **`orgProcedure`** + **`requireOrgRole`** helpers.
- [ ] Apply pattern to org module, storage (when implemented), billing (when implemented).
- [ ] UI role gates for Billing purchase/upgrade (**owner only**).
- [ ] i18n for 403 copy on billing and grants — **TBD** locale keys.

## Out of scope

- Fine-grained custom permissions beyond three roles.
- Delegate grantors (non-owner storage grants).
- Console platform admin impersonating org owner in Account.
- Team/subgroup roles inside org.

## Gaps / open questions

### Decided (recorded)

- [x] **Billing mutations — owner only** (2026-11-14 user decision).
- [x] **Storage grantor — owner only** ([storage-system.md](./storage-system.md)).
- [x] **Manager powers (v1)** — **same as member**; **no invite/remove**.
- [x] **Non-owner billing visibility** — **Billing tab hidden** for managers and members.
- [x] **Cross-org ID policy** — **403 Forbidden** (user chose over 404).

### Deferred to implementation

- [ ] **Better Auth role mapping** — use BA `admin` as manager or custom role plugin config?
- [ ] **AI routes (post–v1)** — same `orgProcedure` when Studio lands; role restrictions per [ai-usage-credits.md](./ai-usage-credits.md) — **no AI routes in v1**.

## Additional findings to resolve before implementation

- **Proposed approach:** Revalidate membership on server requests, protect direct plugin endpoints, serialize ownership changes, scope system jobs, and filter search and activity using storage grants. See the [design answers](./entitlements-design-answers.md#organization-roles-and-rbac); owner-count and transfer policy remain subject to amendment.

- **All entry points:** Better Auth organization endpoints, HTTP handlers, oRPC procedures, billing callbacks, and file access must enforce the same server-side role and membership policy; hiding UI is insufficient.
- **Last owner invariant:** Define atomic ownership transfer, promotion, demotion, account deletion, and concurrent changes so an organization cannot accidentally lose its last owner.
- **Permission freshness:** Define session and cache invalidation after removal or role changes, including operations already in progress.
- **Storage visibility:** Apply grants to search, activity, metadata, downloads, and signed URL issuance as well as file lists; define direct and role-grant behavior after a role change.
- **Background authority:** Define how jobs, webhooks, and internal service calls act without a user session and how their permitted scope is constrained and audited.
- **Sensitive billing reads:** Enforce owner checks for invoice downloads, customer data, portal links, and other reads in addition to purchase mutations.
- **Verification:** Cover direct plugin endpoints, stale sessions, ownership races, cross-org resources, role changes, and unauthorized metadata disclosure in integration tests.

## Implementation slices (after approval)

1. BA organization roles configuration + seed docs in code comments/constants.
2. `orgProcedure` + `requireOrgRole` in security/shared package.
3. Wire org module mutations (invite, remove, role change) with role matrix.
4. Billing UI guards + server checks (**owner** for purchases).
5. Storage grants mutations **owner-only** (when storage slice ships).
6. Tests: cross-org denial, wrong role, missing active org.

## Validation checklist (before sign-off)

- [x] Capabilities matrix rows without TBD resolved or explicitly deferred
- [x] oRPC pattern documented and named procedures listed
- [x] Owner-only billing reflected in matrix + UI section; non-owner tab **hidden**
- [x] Distinction platform admin vs org owner explicit
- [x] Denial codes named; cross-org **403**
- [x] User confirmed sign-off — **2026-11-14**

## Approval

**Sign-off record:**

- [x] User: **APPROVED** **2026-11-14** (batch: manager=member v1, billing hidden non-owners, cross-org 403)

**Workflow:** [../../workflow/04-requirements-first.md](../../workflow/04-requirements-first.md)
