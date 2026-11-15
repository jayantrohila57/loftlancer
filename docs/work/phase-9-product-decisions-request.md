# Phase 9 — Product decisions request

**Date:** 2026-11-14  
**Audience:** Product owner (quick batch approve)  
**Purpose:** Resolve **unapproved** Account areas so workers implement only signed-off slices.  
**Companion:** [phase-9-account-checklist.md](./phase-9-account-checklist.md) (repo audit)

---

## Already approved (do not re-litigate)

| Topic                            | Spec                                                                                                                     | Approved                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Billing, Autumn, Stripe path** | [requirements/autumn-usage-metering.md](./requirements/autumn-usage-metering.md)                                         | **2026-11-14** — self-hosted Autumn OSS, org customer scope, DB enforce + Autumn entitlements, custom billing UI, owner-only billing |
| **Storage system**               | [requirements/storage-system.md](./requirements/storage-system.md)                                                       | **2026-11-14** — org-scoped hub, grants, quota, trash 7d, MIME allowlist, incremental UI                                             |
| **Organizations**                | [requirements/organizations.md](./requirements/organizations.md)                                                         | **2026-11-14** — BA org plugin, active org, email invites, Free 1 org/user                                                           |
| **Org RBAC**                     | [requirements/org-roles-rbac.md](./requirements/org-roles-rbac.md)                                                       | **2026-11-14** — owner/manager/member; billing hidden non-owners; cross-org **403**                                                  |
| **AI gates (no routes v1)**      | [requirements/ai-usage-credits.md](./requirements/ai-usage-credits.md)                                                   | **2026-11-14** — `assertAiInvokeAllowed` only; no AI HTTP/oRPC invoke in v1                                                          |
| **Account deletion**             | Phase 6 + [requirements/account-data-retention-deletion.md](./requirements/account-data-retention-deletion.md) (partial) | Implemented at `/account/privacy-data/account-deletion` → `@modules/security`                                                        |

**Instruction to workers:** Implement billing/storage/org slices **only** per the approved specs above. Do **not** ship net-new placeholder sections without a line item approved below.

---

## Decision batch A — Keep or remove unavailable Account sections?

**Context:** Phase 9 roadmap item _“Decide whether unavailable Account sections stay, are built, or are removed.”_ Today, AI, notifications, privacy (except deletion), help, and most billing sub-tabs use `featureNotAvailable` or “Coming soon.” Storage overview/files are **partial**.

| ID  | Question                                            | **Recommended default**                                                                                                                               | If approved, next slice                                                            |
| --- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A1  | Keep **AI usage** nav (4 tabs) before Studio AI?    | **Keep nav**; tabs stay **read-only placeholders** until [ai-usage-credits.md](./requirements/ai-usage-credits.md) amended with “first Account AI UI” | Single overview tab with balance from `org_entitlement` (owner + all members read) |
| A2  | Keep **Notifications** section?                     | **Keep**; v1 = **email-only** product notifications (security, billing, invites) with **no** in-app inbox                                             | One overview: toggles for categories; Resend when available                        |
| A3  | Keep **Privacy & data** hub separate from Security? | **Keep**; consolidate **marketing/telemetry** consents here; keep **sessions/location** under Security                                                | Consents tab wires new prefs; export tab stub with “request export” email          |
| A4  | Keep **Help & support**?                            | **Keep**; v1 = **static help center** (markdown/docs links) + **mailto support** (no ticket DB)                                                       | Help center tab with i18n articles; support tab = prefilled mailto                 |
| A5  | Remove any section entirely?                        | **Do not remove** unless product explicitly drops scope — incremental UI per [storage-system.md](./requirements/storage-system.md) Q3                 | N/A                                                                                |

**Reply format:** `Approved A1–A5 defaults` or list exceptions (e.g. `A1: remove AI nav until Studio`).

---

## Decision batch B — AI usage (Account UI)

**Approved backend:** gates + credits model only ([ai-usage-credits.md](./requirements/ai-usage-credits.md)).

| ID  | Question                                                           | **Recommended default**                                                                           |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| B1  | Ship Account **AI usage overview** before any Studio invoke route? | **Yes** — read-only: `ai_enabled`, `ai_credit_balance`, link to billing upgrade (owner)           |
| B2  | Show AI section to **Free** orgs?                                  | **Yes**, disabled state + “Upgrade to Paid” CTA (**owner** only for purchase)                     |
| B3  | **Model usage / usage history / limits-alerts** tabs in v1?        | **No** — hide sub-tabs until invoke routes exist; keep overview only                              |
| B4  | Debit model                                                        | **1 credit per invoke** minimum (align with spec TBD); display only in Account until Studio lands |

**Reply:** `Approved B1–B4` or amend B3 if product wants alert thresholds in Account without invoke routes.

**Limits & alerts follow-up:** Draft requirements [requirements/ai-usage-limits-alerts.md](./requirements/ai-usage-limits-alerts.md) (item 119 / AUTH-AI-LIMIT-01). Use decision batch **L** below—not batch B alone—for threshold prefs and optional org spend caps.

## Decision batch L — AI limits and alerts (AUTH-AI-LIMIT-01)

**Draft spec:** [requirements/ai-usage-limits-alerts.md](./requirements/ai-usage-limits-alerts.md) (full architecture and flows).

| ID  | Question                                               | **Recommended default**                                                                                      |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| L1  | Ship limits tab before first **metered invoke** route? | **Alerts-only first** (balance thresholds); **monthly cap enforcement** only after invoke + ledger amendment |
| L2  | Who may **edit** prefs?                                | **Owner only**; all members **read**                                                                         |
| L3  | Preset thresholds v1                                   | **Fixed presets**: “Low balance” (&lt; 10 credits), “Very low” (&lt; 3), “Depleted” (0) — **no custom %**    |
| L4  | Alert recipients                                       | **Org owner email only**; no member opt-in in v1                                                             |
| L5  | Delivery channel v1                                    | **Email** when provider available; else **activity + owner-visible banner** on AI overview only              |
| L6  | Monthly org **spend cap**                              | **Off by default**; owner enables integer cap; denies invoke with `entitlement.org_ai_cap_exceeded`          |
| L7  | Cap period                                             | **Calendar month UTC**; reset on 1st; consumption from `ai_credit_ledger` settled rows only                  |
| L8  | Tab visibility vs **B3**                               | **Keep tab** with honest copy until **L1** slice ships; align with **A1** (do not remove AI nav)             |

**Reply:** `Approved L1–L8 defaults` or list exceptions.

### Implementation status (2026-11-14 workers)

| Surface                      | Repo state                                                               | Blocker                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview `/account/ai-usage` | **Shipped** — `@modules/ai-usage`, oRPC `aiUsage.overview`, cache fields | [ai-usage-credits.md](./requirements/ai-usage-credits.md) lists Account tab out of **v1**; treat as Phase 9 read-only slice until **batch B1** sign-off |
| Usage history                | **Shipped** — settled `ai_credit_ledger` list (often empty)              | No invoke producer → no rows until **first metered route** amendment                                                                                    |
| Model usage                  | **Blocked UI** — honest “waiting on product sign-off”                    | No model dimension on ledger; no metered route                                                                                                          |
| Limits & alerts              | **Blocked UI**                                                           | Draft [requirements/ai-usage-limits-alerts.md](./requirements/ai-usage-limits-alerts.md); batch **L1–L8** awaiting sign-off                             |
| oRPC invoke / Studio         | **Not shipped**                                                          | **A6** — no AI routes in v1                                                                                                                             |

**Worker rule:** Do not add metered invoke routes, model breakdown, or alert CRUD without amending [ai-usage-credits.md](./requirements/ai-usage-credits.md) + recording B1–B4 approval above.

---

## Decision batch C — Notifications

**Draft spec:** [requirements/account-notifications.md](./requirements/account-notifications.md) (awaiting sign-off; **item 113** notes draft in-app/history scope conflicts with C2/C4 defaults until amended). Related: location consent (Phase 6), org wizard mentions timezone for “schedules and notifications” (copy only).

| ID  | Question    | **Recommended default**                                                                                                                |
| --- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Scope       | **Per-user** (not org-wide) email preferences                                                                                          |
| C2  | Channels v1 | **Email only** (no push/SMS/webhook)                                                                                                   |
| C3  | Categories  | **Security** (required on), **Billing** (owner-only emails), **Organization** (invites), **Product** (opt-in marketing off by default) |
| C4  | History     | **None** in v1 (no in-app notification feed)                                                                                           |
| C5  | Storage     | Drizzle `user_notification_preference` or JSON on user prefs table — **new migration** after approve                                   |

**Reply:** `Approved C1–C5` or specify categories/channels.

---

## Decision batch D — Privacy & data (beyond deletion)

**Partial overlap:** Location consent in `@modules/location`; deletion in `@modules/security`.

| ID  | Question             | **Recommended default**                                                                              |
| --- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| D1  | **Consents** tab     | Marketing email, optional analytics (off by default), link to location settings in Security          |
| D2  | **Data export** v1   | **Manual request**: user submits form → email to support with user id + timestamp (no automated ZIP) |
| D3  | **Org data export**  | **Deferred** ([storage-system.md](./requirements/storage-system.md) R8)                              |
| D4  | **Account deletion** | **Keep** current Security flow; privacy tab is **nav shortcut only** (already `done`)                |

**Reply:** `Approved D1–D4` or request automated export scope.

---

## Decision batch E — Help & support

**Draft spec:** [requirements/account-help-support.md](./requirements/account-help-support.md) (awaiting sign-off; **item 113** notes ticket DB in draft conflicts with E2 mailto default).

| ID  | Question            | **Recommended default**                                                                           |
| --- | ------------------- | ------------------------------------------------------------------------------------------------- |
| E1  | Help center content | Curated **static pages** in repo (`docs/help/` or i18n strings) — billing, storage, org, security |
| E2  | Support tickets     | **mailto:** `support@` placeholder env `SUPPORT_EMAIL` (no ticketing integration v1)              |
| E3  | Signed-in context   | Pre-fill mailto with user id + locale (no PII beyond email)                                       |
| E4  | Status page         | **Out of scope** v1                                                                               |

**Reply:** `Approved E1–E4` or name ticket vendor for v2.

**Help center follow-up:** Draft detail in [requirements/account-help-support.md](./requirements/account-help-support.md) (item **114** / AUTH-HELP-CENTER-01). Use batch **HC** below for article path, search, and module boundary—not batch E alone.

## Decision batch HC — Help center (AUTH-HELP-CENTER-01)

| ID  | Question                | **Recommended default**                                                           |
| --- | ----------------------- | --------------------------------------------------------------------------------- |
| HC1 | Article source of truth | `content/help/{locale}/*.md` with YAML frontmatter (slug, title, category)        |
| HC2 | Search v1               | **Client-side** filter on loaded index (title + excerpt)                          |
| HC3 | Missing locale          | **Fallback** to `en-us` body when translation missing                             |
| HC4 | External docs           | **In-app** seed articles; optional outbound links inside article body only        |
| HC5 | Module boundary         | **`@modules/help`** for loader + list/detail; `@modules/shell` keeps hub + mailto |
| HC6 | Article oRPC            | **None** v1 — static git content only                                             |

**Reply:** `Approved HC1–HC6 defaults` or list exceptions (e.g. `HC1: docs/help`).

---

## Decision batch F — Subscription vs billing UX split

**Context:** All `/account/subscription/*` routes currently export the same `@modules/billing` overview.

| ID  | Question                         | **Recommended default**                                                                                                               |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | **Subscription** section purpose | **Plans & entitlements** (tier, included storage, AI flag, credits summary) — read-mostly                                             |
| F2  | **Billing** section purpose      | **Money** (payment methods, invoices, portal, billing details)                                                                        |
| F3  | Implementation order             | After Autumn slice stable: split overview component; subscription tabs get entitlements UI; billing tabs link portal or list invoices |

**Reply:** `Approved F1–F3`.

---

## Decision batch T — Permanent delete (AUTH-TRASH-02)

**Report:** [auth-page-action-report.md](./auth-page-action-report.md) — **AUTH-TRASH-02** (0/100, Proposed).  
**Normative (Approved):** [requirements/storage-system.md](./requirements/storage-system.md) Q8 — soft trash, **7-day** retention, **Vercel Cron** purge + blob `del` on org prefixes only.  
**Normative gap:** Approved spec does **not** define a user-facing “delete forever” or “empty trash” action; only automatic purge ([storage-system.md](./requirements/storage-system.md) APIs sketch `emptyTrash` — **not implemented**).  
**Planning only (not approved):** [requirements/entitlements-design-answers.md](./requirements/entitlements-design-answers.md) — owner may **empty trash early**; per-item manual purge unspecified.

| ID  | Question                                        | **Recommended default**                                                                                                                                                                           |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | Ship **user-initiated permanent delete** in v1? | **Yes** — complements cron; **amend** [storage-system.md](./requirements/storage-system.md) after sign-off                                                                                        |
| T2  | **Who** may permanently delete?                 | **Org owner only** (not grantees with edit); grantees keep **soft trash** + **restore** only                                                                                                      |
| T3  | **Per-item** vs bulk                            | **Per-item** “Delete forever” on Trash tab rows **in retention window**; optional **owner-only** “Empty trash” bulk action (same purge semantics)                                                 |
| T4  | **Confirmation** UX                             | Destructive dialog + **display name** confirm (FormKit pattern); i18n en-us / en-in / es-es                                                                                                       |
| T5  | **Quota** after purge                           | **Free bytes immediately** — trashed items count until purge ([entitlements-design-answers.md](./requirements/entitlements-design-answers.md)); optional Autumn `-byte_size` track on purge event |
| T6  | **Activity**                                    | Reuse **`storage.purge`** for user-initiated purge (metadata: `trigger: "user"` \| `"cron"`); actor = session user for manual, uploader/system for cron                                           |
| T7  | **API**                                         | New oRPC e.g. `storage.trash.purge` (+ optional `emptyTrash`); reuse `purgeExpiredOrgStorageTrash` / shared row purge helper; **never** `loftlancer/avatars/`                                    |
| T8  | **Race** with restore                           | Row lock / skip pattern per entitlements supplement (restore vs purge); reject purge if row already `purgedAt`                                                                                    |

**Repo today (2026-11-14):** Cron **`GET /api/cron/storage-purge`** + `storage.service.purge.ts` (**done**); Trash UI **restore only** (`storage.trash.client.tsx`); **no** client purge RPC.

**Reply:** `Approved T1–T8 defaults` or exceptions. **Workers:** do **not** ship Trash permanent-delete UI or oRPC until batch **T** is recorded in **Sign-off log** and [storage-system.md](./requirements/storage-system.md) is amended.

---

## Decision batch G — Share / manage access (AUTH-FILES-03)

**Report:** [auth-page-action-report.md](./auth-page-action-report.md) — **AUTH-FILES-03** (0/100, Proposed).  
**Normative (Approved):** [requirements/storage-system.md](./requirements/storage-system.md) — **owner-only grantor** (R3, S7); grants imply **view + edit**; **external share links deferred** (R6). Rollout phase **5 — Permissions UI**.  
**Not in scope for AUTH-FILES-03:** Internet-wide/public org blob URLs, anonymous CDN links, or “copy link” share slice.

| ID  | Question                        | **Recommended default**                                                                                                                                                     |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | Meaning of **“share”** on Files | **Internal org access** — owner grants folder or file to a **member**; access via **signed download** (1h TTL), not public URLs                                             |
| G2  | **Who** sees manage-access UI?  | **Org owner only**; managers/members see Files per existing grants only                                                                                                     |
| G3  | **UI placement**                | Files tab — owner actions on folder row + file row: **“Manage access”** sheet/dialog (list grants, add, revoke); no separate nav tab v1                                     |
| G4  | **Grantee picker**              | Active org **members** only (`userId`); reject non-members (matches `storage.grantee_not_member`)                                                                           |
| G5  | **Grant shape**                 | **Either** `folderId` **or** `itemId` (existing oRPC); **`includesDescendants`** default **true** for folder grants                                                         |
| G6  | **Duplicate grants**            | **Reject** second grant same `(userId, folderId\|itemId)` with stable error; no silent merge v1                                                                             |
| G7  | **Member removed from org**     | **Auto-revoke** all `org_storage_grant` rows for that `userId` in org (hook on membership delete — amend [organizations.md](./requirements/organizations.md) when approved) |
| G8  | **Activity**                    | Existing **`storage.grant.create`** / **`storage.grant.revoke`** — no new action IDs                                                                                        |

**Repo today (2026-11-14):** oRPC **`listGrants` / `createGrant` / `revokeGrant`** via `storageOrgOwnerProcedure` (**partial** #26); ACL enforced in list/download/trash (`tests/storage-grant-scope.test.ts`, `tests/storage-hub-access.test.ts`); **no** Account grants UI.

**Reply:** `Approved G1–G8 defaults` or exceptions. **Workers:** grants **UI** is allowed under approved storage phase 5 **after** batch **G** sign-off; do **not** build external share-link UX without a new requirements amendment.

### Implementation status (item 120 — 2026-11-14)

| Surface              | Report ID               | Repo state                        | Blocker                                 |
| -------------------- | ----------------------- | --------------------------------- | --------------------------------------- |
| Trash list / restore | AUTH-TRASH-01           | **Partial** — UI + oRPC           | Browser QA; live Blob race              |
| Permanent delete     | AUTH-TRASH-02           | **Not shipped** — cron purge only | Batch **T1–T8** + storage doc amendment |
| Grant APIs           | AUTH-FILES-03 (backend) | **Partial** — owner oRPC          | Non-owner **403** tested                |
| Manage access UI     | AUTH-FILES-03 (UI)      | **Not shipped**                   | Batch **G1–G8** sign-off                |

---

## Open items from approved specs (still TBD — flag for coordinator)

These are **not** new product areas but block **production-ready** billing/storage:

| Item                              | Spec reference                                                           | Recommended interim                                                               |
| --------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Storage credit semantics          | [autumn-usage-metering.md](./requirements/autumn-usage-metering.md) gaps | Treat credits as **quota bump** synced to `quota_bytes` until amended             |
| Fail-safe stale entitlement cache | Platform plan §4.8                                                       | **Deny upload/upgrade** when `entitlementsDegraded` (UI already warns on billing) |
| Webhook placement                 | autumn spec                                                              | **Keep** `apps/auth` `/api/billing/webhook` only                                  |
| Over-quota after downgrade        | Platform plan                                                            | **Block new uploads**; reads OK (storage spec)                                    |

---

## Sign-off block (copy/paste)

```
Phase 9 product decisions:
- [ ] Approved A1–A5 defaults (or exceptions: ___)
- [ ] Approved B1–B4
- [ ] Approved L1–L8 (or exceptions: ___)
- [ ] Approved C1–C5
- [ ] Approved D1–D4
- [ ] Approved E1–E4
- [ ] Approved HC1–HC6 (help center — item 114)
- [ ] Approved F1–F3
- [ ] Approved T1–T8 (or exceptions: ___)
- [ ] Approved G1–G8 (or exceptions: ___)
- [ ] Worker may implement only checklist rows whose specs are approved above
Signed off by: ___  Date: ___
```

Record sign-off in this file under **Sign-off log** when the user replies.

---

## Sign-off log

| Date       | Decision   | Notes                                                                                                                                                                                         |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-15 | A–G, L, HC | User: **“complete them in one go”** — approved **recommended defaults** for batches A1–A5, B1–B4, L1–L8, C1–C5, D1–D4, E1–E4, HC1–HC6, F1–F3, T1–T8, G1–G8 unless noted in implementation PR. |

---

## Document control

| Version | Date       | Change                                                                 |
| ------- | ---------- | ---------------------------------------------------------------------- |
| 1.0     | 2026-11-14 | Initial decisions request from Phase 9 audit                           |
| 1.1     | 2026-11-14 | Item **120** — batches **T** (AUTH-TRASH-02) and **G** (AUTH-FILES-03) |
