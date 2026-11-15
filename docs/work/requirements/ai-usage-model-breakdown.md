# Requirements: AI usage — per-model breakdown (Account)

**Status:** Draft — awaiting user sign-off  
**Approved by:** _(pending)_  
**Date:** 2026-11-14  
**Layers:** packages / modules / apps  
**Report ID:** AUTH-AI-MODEL-01  
**Related:**

| Doc                                                                                     | Relationship                                                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [ai-usage-credits.md](./ai-usage-credits.md)                                            | **Approved** — A6: no AI invoke routes in v1; ledger hold/settle design        |
| [org-roles-rbac.md](./org-roles-rbac.md)                                                | **Approved** — org context; cross-org **403**                                  |
| [autumn-usage-metering.md](./autumn-usage-metering.md)                                  | **Approved** — `ai_usage_credits` feature                                      |
| [entitlements-design-answers.md](./entitlements-design-answers.md#ai-usage-and-credits) | Proposed hold/settle, integer credits, idempotency                             |
| [phase-9-product-decisions-request.md](../phase-9-product-decisions-request.md)         | Batch **B3** — defer model tab until metered routes; **B4** — 1 credit minimum |
| [platform-entitlements-plan.md](../platform-entitlements-plan.md)                       | Org-scoped AI column in restriction matrix                                     |

## Goal

Let **any org member** with an active organization see **how AI credits were consumed by model** over a chosen period — read-only, org-scoped — on `/account/ai-usage/model-usage`, consistent with overview and usage history.

## Current repo state (2026-11-14)

| Area   | State                                                                                        |
| ------ | -------------------------------------------------------------------------------------------- |
| Route  | `apps/auth/.../ai-usage/model-usage/page.tsx` → `AiUsageModelUsagePage`                      |
| UI     | **Blocked** empty state (`aiUsageTabBlockedTitle`, `aiUsageModelUsageBlockedDescription`)    |
| oRPC   | **No** `modelUsage` procedure (only `overview`, `usageHistory`)                              |
| Ledger | `ai_credit_ledger` has **no** model attribution columns (`amount`, `state`, timestamps only) |
| Tests  | `tests/ai-usage-client-states.test.tsx` asserts blocked copy                                 |

**No implementation** is approved until this doc and a **first metered invoke** amendment to [ai-usage-credits.md](./ai-usage-credits.md) are signed off.

## In scope (proposed — not approved)

- [ ] oRPC `aiUsage.modelUsage` — org-scoped aggregates by model id.
- [ ] `@modules/ai-usage` table/chart UI: model name, settled invoke count, credits consumed, optional last-used timestamp.
- [ ] Default window: **last 30 days** (calendar, org timezone from user prefs when available; UTC fallback).
- [ ] Empty state when no settled rows (distinct from “tab blocked”).
- [ ] i18n: `en-us`, `en-in`, `es-es`.
- [ ] Denials aligned with history: `auth.no_active_org`, `rbac.not_member`, `billing.entitlement_missing`, `rbac.cross_org` N/A (no resource id).

## Out of scope (default)

- Per-user breakdown inside the org (v1 is **org totals** only).
- Editing models, quotas, or provider configuration.
- Token-level or cost-in-USD views until debit model amendment allows it.
- Autumn dashboard as SoT for breakdown (DB ledger is SoT for Account UI).
- Studio route picker or live invoke from this tab.
- Limits & alerts (separate spec — AUTH-AI-LIMIT-01).

## Product rules (proposed)

| Condition                   | Model usage tab behavior                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Not signed in               | Redirect / session gate (existing account shell)                                                                                |
| No active org               | Org picker empty state (match overview/history)                                                                                 |
| Free / `ai_enabled=false`   | **Show tab** with read-only aggregates if any historical settled rows exist; else upgrade/disable copy consistent with overview |
| Paid, no metered routes yet | **Blocked** empty state (current) **or** honest “no data yet” once invoke ships                                                 |
| Paid, data exists           | Table sorted by credits desc                                                                                                    |

**RBAC (proposed):** **All org members** (owner, manager, member) **read** — same as usage history. **No** owner-only gate. Billing purchase CTAs stay on overview only.

## Data model (proposed — requires migration)

Extend settlement metadata on `ai_credit_ledger` (or companion table) when a hold **settles**:

| Field             | Type                            | Notes                                                       |
| ----------------- | ------------------------------- | ----------------------------------------------------------- |
| `model_id`        | `text` NOT NULL on settled rows | Stable catalog key, not raw provider secret                 |
| `route_id`        | `text` optional                 | First metered oRPC/route name for debugging                 |
| `credits_settled` | `integer`                       | Defaults to ledger `amount`; supports N-credit routes later |

**Model catalog (proposed):** Central enum or config in `@modules/ai-usage` / `@packages/billing` mapping `model_id` → display label + provider family; invoke path **must** set `model_id` at settle time.

**Aggregation query:** `WHERE organization_id = ? AND state = 'settled' AND settled_at >= ?` → `GROUP BY model_id` → `SUM(amount)`, `COUNT(*)`, `MAX(settled_at)`.

## Architecture

| Layer                       | Responsibility                                                                  |
| --------------------------- | ------------------------------------------------------------------------------- |
| `packages/drizzle`          | Ledger columns + index `(organization_id, model_id, settled_at)` after approval |
| First metered invoke module | Writes `model_id` on settle (enforcement spec in ai-usage-credits)              |
| `modules/ai-usage`          | `modelUsage` service, repository, client screen, schemas                        |
| `apps/auth`                 | Thin route only                                                                 |

## End-to-end flow (when approved)

1. User opens **Model usage** tab with active org.
2. Client calls `aiUsage.modelUsage` with optional `since` (default 30d).
3. Server: `storageOrgProcedure` → membership → read aggregates from DB.
4. UI renders table; empty → “No usage in this period.”
5. Owner sees no extra actions on this tab (billing link remains on overview).

## Dependencies (blockers)

1. **Amend** [ai-usage-credits.md](./ai-usage-credits.md) — name **first metered route(s)** and require `model_id` on settle.
2. **Product:** Resolve batch **B3** tension — nav kept with blocked tabs (shipped) vs “hide until data exists.”
3. **Debit model** open question (flat 1 credit vs variable) affects whether breakdown is invoke-count-only or credits-weighted.
4. Ledger migration + backfill policy (**no backfill** for pre-attribute rows — show as `unknown` bucket **optional**).

## Decisions (needs sign-off)

| ID  | Topic                 | Proposed default                                                         |
| --- | --------------------- | ------------------------------------------------------------------------ |
| M1  | Who can read          | All org members                                                          |
| M2  | `model_id` source     | Set at settle from route config; provider model string mapped to catalog |
| M3  | Default period        | Rolling 30 days                                                          |
| M4  | Free orgs             | Show tab; aggregates empty + same disabled/upgrade framing as overview   |
| M5  | Pre-attribute history | Omit from breakdown (or single “unknown” row if product wants)           |
| M6  | Pagination            | Top **50** models by credits; full export deferred                       |

## Gaps / open questions

- [ ] Confirm **B3** exception: keep visible blocked tab vs hide sub-nav until `meteredRoutesAvailable === true`.
- [ ] Whether managers need **redacted** model list for compliance (default: no redaction).
- [ ] Activity / audit: emit `ai.usage.view_model_breakdown` or rely on generic page views (default: **no** new activity id v1).
- [ ] Console/Studio: same module re-export or auth-only v1 (default: **auth-only** until second app asks).

## Validation checklist (before sign-off)

- [ ] RBAC matches org-roles-rbac and history parity
- [ ] Schema + first invoke slice named in ai-usage-credits amendment
- [ ] Denial codes documented
- [ ] i18n keys listed
- [ ] User sign-off recorded below

## Approval

**Sign-off record:**

- [ ] User: **APPROVED** \_\_\_ (date)

**Workflow:** [../../workflow/04-requirements-first.md](../../workflow/04-requirements-first.md)
