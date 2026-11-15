# Work requirements (specs before code)

Living specs for **in-flight initiatives**. Agents **MUST** get user approval on the doc before implementing.

| Doc                                                                                  | Status                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [auth-account.md](./auth-account.md)                                                 | **Implemented — browser QA pending**                                                                                                                                                     |
| [better-auth.md](./better-auth.md)                                                   | **Draft — awaiting sign-off**                                                                                                                                                            |
| [form-input-fields.md](./form-input-fields.md)                                       | **Done**                                                                                                                                                                                 |
| [orpc-account-sessions.md](./orpc-account-sessions.md)                               | **Draft — awaiting sign-off**                                                                                                                                                            |
| [auth-api-migration.md](./auth-api-migration.md)                                     | **Implementing**                                                                                                                                                                         |
| [orpc-openapi.md](./orpc-openapi.md)                                                 | **Done**                                                                                                                                                                                 |
| [security-module-structure.md](./security-module-structure.md)                       | **Draft — under discussion**                                                                                                                                                             |
| [module-structure.md](./module-structure.md)                                         | **Draft — under discussion**                                                                                                                                                             |
| [application-activity.md](./application-activity.md)                                 | **Implemented — browser QA and legacy retirement pending**                                                                                                                               |
| [profile-avatar-blob.md](./profile-avatar-blob.md)                                   | **Approved — Option A (no auto delete); browser QA deferred**                                                                                                                            |
| [profile-optional-fields.md](./profile-optional-fields.md)                           | **Draft — awaiting sign-off** (Phase 4 — **S2** `profile_details` preference, 2026-11-14 batch)                                                                                          |
| [profile-completion.md](./profile-completion.md)                                     | **Draft — optional fields blocked on profile-optional-fields**                                                                                                                           |
| [account-data-retention-deletion.md](./account-data-retention-deletion.md)           | **Draft — awaiting sign-off** (Phase 6 soft delete + last-copy email direction, 2026-11-14 batch)                                                                                        |
| [audit-data-versioning.md](./audit-data-versioning.md)                               | **Draft** — direction recorded (2026-11-14 batch)                                                                                                                                        |
| [activity-failed-sign-in-page-visits.md](./activity-failed-sign-in-page-visits.md)   | **Partial approval** (2026-11-14 batch: **F2**, **P0**) — full sign-off pending (Phase 7)                                                                                                |
| [activity-deeplinks-legacy-retirement.md](./activity-deeplinks-legacy-retirement.md) | **Partial approval** (2026-11-14 batch: R1 refined, C1, L1, drop tables+data) — full sign-off pending (Phase 7)                                                                          |
| [storage-system.md](./storage-system.md)                                             | **Approved** (2026-11-14) — Phase 9 org storage hub; **quota amendment applied** (2 GB Free / 5 GB Paid + credits); implement after Better Auth org slice                                |
| [autumn-usage-metering.md](./autumn-usage-metering.md)                               | **Approved** (2026-11-14) · **Amended** — self-hosted Autumn OSS; local runbook [infra/autumn/README.md](../../../infra/autumn/README.md); `AUTUMN_API_BASE_URL` wired (default `:4002`) |
| [organizations.md](./organizations.md)                                               | **Approved** (2026-11-14) — Better Auth org plugin; active org; **email** invites; Free **`organization_count` = 1**; Autumn customer on create                                          |
| [organization-onboarding-wizard.md](./organization-onboarding-wizard.md)             | **Draft — awaiting sign-off** — 8-step create wizard, mapcn location, metadata v2 → normalized tables; extends approved org slice                                                        |
| [org-roles-rbac.md](./org-roles-rbac.md)                                             | **Approved** (2026-11-14) — owner / manager / member; manager=member v1 (no invite/remove); **Billing tab hidden** non-owners; **403** cross-org                                         |
| [ai-usage-credits.md](./ai-usage-credits.md)                                         | **Approved** (2026-11-14) — gate patterns + credits model; **no AI routes in v1**; enforcement spec for Studio later                                                                     |
| [ai-usage-limits-alerts.md](./ai-usage-limits-alerts.md)                             | **Draft — awaiting sign-off** (item 119 / AUTH-AI-LIMIT-01) — org alert thresholds + optional monthly cap; blocked UI until batch **L**                                                  |
| [ai-usage-model-breakdown.md](./ai-usage-model-breakdown.md)                         | **Draft — awaiting sign-off** (item 118 / AUTH-AI-MODEL-01) — per-model Account tab; blocked on first metered route + ledger `model_id`                                                  |
| [../platform-entitlements-plan.md](../platform-entitlements-plan.md)                 | **Planning** (not a requirements sign-off doc) — master map: auth, orgs, RBAC, subscriptions, credits, storage/AI gates, phases                                                          |
| [entitlements-design-answers.md](./entitlements-design-answers.md)                   | **Planning supplement** — design Q&A aligned to approved entitlements specs (idempotency, webhooks, 403 policy, interim quota)                                                           |
| [account-notifications.md](./account-notifications.md)                               | **Draft — awaiting sign-off** (item **113** / AUTH-NOTIFY-01; batch **C1–C5**)                                                                                                           |
| [account-help-support.md](./account-help-support.md)                                 | **Draft — awaiting sign-off** (item **113** hub/tickets, **114** help center; AUTH-HELP-01 / AUTH-TICKET-01; batch **E1–E4**)                                                            |
| [account-privacy-consents.md](./account-privacy-consents.md)                         | **Draft — awaiting sign-off** (Phase 9; location **approved** elsewhere; marketing/analytics matrix blocked on **D1**)                                                                   |

## Template (copy for new `<slug>.md`)

```markdown
# Requirements: <title>

**Status:** Draft | Approved | Implementing | Done  
**Approved by:** _(name/date — fill on sign-off)_  
**Layers:** packages / features / modules / apps _(check all that apply)_

## Goal

_One paragraph, user language._

## In scope

- [ ] …

## Out of scope

- …

## Architecture (layer map)

| Decision           | Choice | Notes                         |
| ------------------ | ------ | ----------------------------- |
| SDK / DB           |        | `@packages/…` only for vendor |
| Domain UI / config |        | `@modules/…`                  |
| Routes / env       |        | `apps/auth`                   |

## End-to-end flow

1. User …
2. System …

## Environment

| Variable | Required | Purpose |
| -------- | -------- | ------- |

## Plugins / integrations

| Capability | Yes/No | Package/plugin |
| ---------- | ------ | -------------- |

## Roles & authorization

_Define roles, where enforced (org plugin vs app), permission model._

## Gaps / open questions

- [ ] …

## Implementation slices (after approval)

1. …
2. …

## Validation checklist (before sign-off)

- [ ] Every env var listed
- [ ] Every route/page named
- [ ] DB migration path agreed
- [ ] No unnamed defaults
- [ ] User confirmed sign-off
```

**Workflow:** [../../workflow/04-requirements-first.md](../../workflow/04-requirements-first.md)
