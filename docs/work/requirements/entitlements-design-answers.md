# Entitlements design answers (v1)

**Status:** Planning supplement — **not** a substitute for approved requirements sign-off  
**Date:** 2026-11-14  
**Audience:** Implementation agents and reviewers  
**Normative inputs (Approved):** [ai-usage-credits.md](./ai-usage-credits.md) · [autumn-usage-metering.md](./autumn-usage-metering.md) · [org-roles-rbac.md](./org-roles-rbac.md) · [organizations.md](./organizations.md) · [storage-system.md](./storage-system.md) · [platform-entitlements-plan.md](../platform-entitlements-plan.md)

This document answers **concrete design questions** raised during entitlements planning. Where an answer restates an approved requirement, it is **Approved**. Where approved specs are silent, the answer is marked **Proposed (v1 default)** and must align with **DB enforce + Autumn entitlements**.

## Addendum (2026-11-14): self-host + AI Gateway

| Topic                 | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Autumn hosting**    | **Self-hosted Autumn OSS** — not Autumn cloud SaaS. Dev uses a **shared team self-hosted instance** (`AUTUMN_API_BASE_URL` + dashboard-issued `AUTUMN_SECRET_KEY`). Isolation: separate keys/instances for preview vs prod when possible; customer id dedupe and webhook idempotency unchanged ([shared test environments](#how-will-shared-test-environments-prevent-developers-and-preview-deployments-from-modifying-each-others-billing-data)). |
| **Plugin / SDK**      | Keep Better Auth `autumn()` + `check`/`track`; point API at self-host via **`baseURL`** / **`autumnURL`** (`autumn-js@1.5.11` types). `@packages/billing` direct SDK must use the **same** base URL env.                                                                                                                                                                                                                                            |
| **Ops**               | Autumn OSS deploy/upgrade/backups are **out of app repo** — document env contracts only until ops slice exists.                                                                                                                                                                                                                                                                                                                                     |
| **Vercel AI Gateway** | **Deferred** until the **first AI HTTP route** ships (post–v1 gate-only work). Use for **provider routing** and **internal spend attribution** tagged by **`organizationId`** — **not** customer-facing billing (Autumn `ai_usage_credits` remains product meter). No AI Gateway env or code in v1.                                                                                                                                                 |

Normative detail: [autumn-usage-metering.md](./autumn-usage-metering.md) (amended 2026-11-14) · phase note: [platform-entitlements-plan.md](../platform-entitlements-plan.md) Phase **9b**.

## Validation findings — implementation blockers

The answers below are proposals, not approved amendments. Do not implement the following inconsistent or unverified details as written:

- **Blob access:** A public store cannot provide private org files by choosing `access: 'private'` per object. Store access is fixed at creation ([Vercel Blob documentation](https://vercel.com/docs/vercel-blob/using-blob-sdk)). The single-store and private-org requirements need an agreed architecture amendment; a public avatar pathname also conflicts with org-only visibility. The storage answer below is not a valid implementation.
- **AI uncertain outcomes:** A ledger hold alone cannot prove whether a provider completed a call after a crash or prevent another provider call. Automatic refund on timeout or lease expiry risks free usage or duplicate invocation. Define an unknown-outcome state, provider-specific idempotency or reconciliation, and recovery before a route is implemented.
- **AI balance merge:** Subtracting only pending holds from an Autumn snapshot omits settled but unreported debits, can double-count purchases, and does not establish ordering. The formula and additive webhook rule below are illustrative only; a versioned reconciliation and exactly-once accounting design remains open.
- **Storage quota:** Pending items and their separate reservations must be counted once. If trashed items already count toward usage, restoring one must not add its size again. Reservation locking and restore/purge serialization require an explicit implementation design.
- **Billing freshness:** The proposed 15-minute degradation, 24-hour denial, and three-day failure policies conflict. A lack of webhook events does not prove sync failure. Define freshness using successful authoritative checks, a single threshold, and an approved outage policy.
- **Provider contracts:** Autumn webhook signatures, event types, timestamps, customer lookup/idempotency, track deduplication, and negative storage deltas must be verified against the installed SDK and current provider APIs before adopting the examples below.
- **Authorization and ownership:** Hiding Better Auth client methods does not secure exposed endpoints. Ownership transfer and the per-user cap must be enforced transactionally across all paths; the proposed owned-org cap on transfer needs an explicit product decision.
- **Plan status:** The approved interim 5 GB allowance is broader than the proposed production restriction; narrowing it requires an amendment. The AI document does not approve a flat one-credit debit or an unconditional stale-cache denial.

**Conventions**

| Marker                    | Meaning                                           |
| ------------------------- | ------------------------------------------------- |
| **Approved**              | Matches a signed-off requirements doc             |
| **Proposed (v1 default)** | Consistent default until a requirements amendment |

**Global policies (carry across domains)**

- **HTTP cross-org / wrong membership:** **403** with `rbac.cross_org` or `rbac.forbidden` — never **404** to disguise existence ([org-roles-rbac.md](./org-roles-rbac.md) R5).
- **Tenancy:** Org-scoped billing, storage, and (future) AI; session **active organization** is authoritative over client-supplied org ids ([organizations.md](./organizations.md) O3).
- **Quota interim:** Until **Autumn → DB plan-limit sync** ships, storage slices may use a **5 GB constant** for gates/UI; after sync, **Free = 2 GB**, **Paid = 5 GB** + credits ([storage-system.md](./storage-system.md#quotas-and-limits-decided--tbd), [autumn-usage-metering.md](./autumn-usage-metering.md#storage-spec-amendment)).
- **Dev billing:** `AUTUMN_SECRET_KEY` + **`AUTUMN_API_BASE_URL`** **required** in all environments including local dev — shared **self-hosted Autumn OSS** dev instance ([autumn-usage-metering.md](./autumn-usage-metering.md) Q5, Q9).
- **v1 AI:** Gate patterns and ledger design only — **no AI HTTP/oRPC invoke routes** ([ai-usage-credits.md](./ai-usage-credits.md)).

---

## AI usage and credits

_Normative gate model:_ [ai-usage-credits.md](./ai-usage-credits.md). Applies when the **first AI route** amendment lands; helpers may ship earlier with **no callers**.

### How will credits be reserved before a provider call, then settled or released after success, failure, timeout, or cancellation?

**Proposed (v1 default):** Use a **hold → settle / release** pattern in Postgres inside a single org-scoped transaction. On allow (after `assertAiInvokeAllowed`), insert an `ai_usage_ledger` row in state `held` with a **unique idempotency key** (client `X-Idempotency-Key` or server-generated request id), decrement **`ai_credit_balance`** by the held amount (default **1 credit** per invoke until debit model is amended), and store `held_at`, `expires_at` (**15 minutes**). On provider **success**, transition the row to `settled` and keep the balance decrement (settlement is idempotent on the same key). On **failure**, **timeout**, or **cancellation** before success, transition to `released` and **restore** the held amount to `ai_credit_balance` in the same transaction. The HTTP handler must not call the provider until the hold transaction commits.

### What happens if the provider succeeds but the application crashes before recording the debit or returning the result?

**Proposed (v1 default):** Treat the hold as the **source of truth**: credits are already debited when the hold commits, so a crash after provider success does not double-charge on retry (retry with the same idempotency key returns the stored outcome if a `settled` row exists, or completes settlement). A background **reaper** marks `held` rows past `expires_at` as `released` and refunds balance **unless** a partial `settled` marker exists (lease extended while provider call is in-flight via heartbeat column **Proposed**). Provider calls should pass the **idempotency key** to the provider when the vendor supports it; otherwise rely on application ledger only. Users may see a failed response while usage was consumed — support uses ledger + activity, not Stripe/Autumn per-invoke SoT ([ai-usage-credits.md](./ai-usage-credits.md) A2).

### How will retries avoid both duplicate provider calls and duplicate charges?

**Approved pattern + Proposed detail:** **Approved:** idempotent decrement with client/request id ([ai-usage-credits.md](./ai-usage-credits.md) future-route spec §4). **Proposed:** Require **`X-Idempotency-Key`** (UUID v4) on invoke routes; **unique constraint** on `(organization_id, idempotency_key)` in the ledger. Retries with the same key: if `settled`, return cached result metadata without re-invoking provider; if `held` and not expired, complete or release without second hold; if `released`, deny or require a **new** key (product copy: “request expired, retry”). **Replay window: 24 hours** for same-key replay; after that, new key required. Optional async Autumn `track` uses the **same idempotency key** in payload for vendor deduplication.

### How will the system prevent a credit purchase or entitlement refresh from overwriting pending local consumption?

**Proposed (v1 default):** **Never** set `ai_credit_balance` from Autumn sync to a raw Autumn number while unresolved `held` rows exist; sync computes `autumn_reported_balance - sum(held_amount)` or applies a **monotonic merge**: `new_balance = max(autumn_balance - local_pending_holds, 0)`. Purchase webhooks **add** to balance (`balance += purchased_amount`) in a transaction keyed by **webhook event id**, not blind overwrite. **`entitlements_synced_at`** updates only after merge succeeds. `ai_enabled` may flip from Autumn independently, but invoke gate still respects active holds.

### How will failed asynchronous usage reports be retried, reconciled, and monitored?

**Approved:** Autumn `track` is **optional and non-blocking** ([ai-usage-credits.md](./ai-usage-credits.md) A3). **Proposed:** Enqueue `autumn_track_outbox` rows `(organization_id, feature_id, value, idempotency_key, status)` after successful **settlement**; worker retries with exponential backoff (**max 7 days**), then `dead_letter` with alert. Nightly reconciliation job compares **count/sum of settled ledger** vs Autumn usage API for `ai_usage_credits` per org customer; drift &gt; threshold pages ops. Metrics: `ai.autumn_track_failed`, `ai.ledger_autumn_drift`.

### Can purchased credits expire, be refunded, or remain available after a downgrade and later upgrade?

**Approved:** Credit packs live in **Autumn dashboard** ([autumn-usage-metering.md](./autumn-usage-metering.md)); Free cannot purchase ([ai-usage-credits.md](./ai-usage-credits.md)). **Proposed (v1 default):** **No expiry** on purchased `ai_usage_credits` in v1 unless Autumn product config explicitly sets expiry (document in dashboard runbook). **Refunds/chargebacks:** webhook sets balance from Autumn after event; local holds must be settled/released first. **Downgrade:** `ai_enabled=false` blocks new invokes (**Approved**); **remaining credit balance stays** on the Autumn customer and in DB cache (not zeroed on downgrade). **Re-upgrade:** `ai_enabled=true`; prior balance available without repurchase.

### How will fractional credits, rounding, and insufficient balance for an operation costing more than one credit work?

**Approved:** “1 invoke = 1 credit minimum for v1 unless dashboard defines fractional” ([ai-usage-credits.md](./ai-usage-credits.md)). **Proposed (v1 default):** Ledger stores **integer credits** only; `ai_credit_balance` is **numeric(12,0)** or integer. Pre-invoke gate: `balance >= hold_amount` where `hold_amount` defaults to **1** per route. If a future operation needs **N** credits, gate checks `balance >= N` before hold of **N**. **Rounding:** always **floor** when converting from token/cost models (deferred amendment). Insufficient balance → **403** `entitlement.no_credits` before provider call.

### What should happen when a subscription changes while an AI request is in progress?

**Approved:** Paid + `ai_enabled` + balance &gt; 0 to allow invoke ([platform-entitlements-plan.md](../platform-entitlements-plan.md) §4.7). **Proposed:** Subscription change does **not abort in-flight** provider calls; hold was taken under prior snapshot. Settlement still applies. **New** requests after webhook sync read updated `ai_enabled` / `subscription_status`; downgrade mid-flight may leave a paid-era hold settling while subsequent calls get `entitlement.ai_disabled` or `billing.subscription_inactive`. Cache sync should be **transactionally visible** before new gates pass.

### How will users distinguish a provider failure from an entitlement or credit failure?

**Approved:** Stable denial codes for entitlements ([ai-usage-credits.md](./ai-usage-credits.md)). **Proposed:** **403** + `entitlement.*` / `billing.*` for gates; **502/503** + `ai.provider_error` (or oRPC equivalent) for provider failures **after** gate passed; activity IDs `ai.denied_*` vs `ai.invoke_failed`. UI: entitlement errors show billing/credits CTA (owner purchase); provider errors show retry without implying billing change. Never map entitlement failures to 404.

---

## Autumn usage metering

_Normative:_ [autumn-usage-metering.md](./autumn-usage-metering.md), cache fields in [platform-entitlements-plan.md](../platform-entitlements-plan.md) §4.8.

### How will webhook signatures be verified, and how will duplicate, delayed, missing, or out-of-order events be handled?

**Proposed (v1 default):** Verify every webhook with **Autumn/Stripe signing secret** in `@packages/billing` before side effects; reject unsigned with **401**. Persist processed events in **`billing_webhook_event`** with columns: `event_id` (PK), `event_type`, `customer_id`, `organization_id`, `payload_hash`, `received_at`, `processed_at`, `status`.

| Situation                     | Policy                                                                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Duplicate** same `event_id` | **200 OK**, no-op (idempotent)                                                                                                                                                                  |
| **Delayed**                   | Apply when received; compare `occurred_at` vs `entitlements_synced_at` — **last-write-wins per field group** (plan tier, credits) using event timestamp                                         |
| **Missing**                   | Nightly **reconciliation** job pulls Autumn customer/subscription state ([below](#what-scheduled-reconciliation-repairs-missed-events-and-detects-differences-between-autumn-and-the-database)) |
| **Out-of-order**              | Plan downgrades use **older `occurred_at` ignored** if DB already has newer subscription version counter **Proposed** `subscription_revision`                                                   |

### What scheduled reconciliation repairs missed events and detects differences between Autumn and the database?

**Proposed (v1 default):** **Daily cron** (Vercel Cron secured route) iterates orgs with `autumn_customer_id`, fetches Autumn entitlements/subscription, diffs against Drizzle cache (`plan_tier`, `quota_bytes`, `ai_enabled`, credit balances), and **writes cache + `entitlements_synced_at`** on mismatch. Emits metric `billing.entitlement_drift` and activity `billing.reconcile_applied`. On repeated failure (**3 consecutive days**), alert and **fail-safe: deny new uploads and AI** (align with AI doc stale-cache default **deny** — [ai-usage-credits.md](./ai-usage-credits.md) open question, adopted as v1 default for **AI**; **Proposed** for uploads: **deny new uploads**, allow read/delete).

### What happens when a downgrade, cancellation, expired storage credit, or failed payment leaves an organization above its new storage quota?

**Approved (matrix):** Block **new** uploads; reads per grants ([platform-entitlements-plan.md](../platform-entitlements-plan.md) §4.7). **Proposed:** `used_bytes > quota_bytes` → `initUpload` returns **403** `quota.storage_exceeded`; **no automatic file deletion** on downgrade. UI shows over-quota banner; owner CTA upgrade/credits. Storage credit **expiry** (if configured in Autumn) lowers effective `quota_bytes` via sync — same rule. **Failed payment** sets `subscription_status=past_due`; same upload block; read-only policy **Approved** as TBD — **Proposed v1:** reads/download allowed for granted members; owner may still manage trash.

### When does a plan change take effect: checkout completion, payment confirmation, renewal, or the entitlement update?

**Proposed (v1 default):** **Product entitlement for gates** takes effect when the **Autumn → DB sync handler** commits after the authoritative Autumn event — typically **`subscription.updated`** (paid active) or **`checkout.session.completed`** equivalent in Autumn’s webhook surface. **UI** may show “pending” until `entitlements_synced_at` advances. **Renewals** refresh `subscription_status` and included grants; do not reset org storage usage. **Free → Paid:** `quota_bytes` → 5 GB, `ai_enabled` → true on that commit.

### How will checkout cancellation, abandoned checkout, failed payment, refunds, and chargebacks affect cached entitlements?

**Proposed (v1 default):** **Abandoned/cancelled checkout:** no cache change (still prior plan). **Failed payment:** webhook → `subscription_status=past_due`; no upgrade fields applied until payment succeeds. **Refund/chargeback** on subscription: Autumn downgrades → sync reverts `plan_tier`, `quota_bytes`, `ai_enabled=false` per Autumn state. **Credit-only refunds:** adjust `ai_credit_balance` / storage credit fields from Autumn balance APIs; ledger holds respected. Never infer from client redirect alone.

### How will optional storage tracking represent current usage without double-counting uploads, deletions, retries, or restores?

**Approved:** Optional **async** `track` for `org_storage_bytes`; **not** upload gate SoT ([autumn-usage-metering.md](./autumn-usage-metering.md)). **Proposed:** Track **deltas** only: `+byte_size` on upload complete, `-byte_size` on permanent delete/purge; **no track** on trash/restore (metadata status change only). Each track carries **`idempotency_key`** = `storage_item_id` + `event_type` + `revision`. Retries dedupe at outbox. Autumn meter reflects **billing narrative**, while **Drizzle sum** remains enforcement truth.

### How will shared test environments prevent developers and preview deployments from modifying each other’s billing data?

**Approved:** Shared **self-hosted Autumn OSS** dev instance in dev ([autumn-usage-metering.md](./autumn-usage-metering.md) Q5, Q9). **Proposed:** **Prefix Autumn external ids** or use Autumn **test mode** customers per developer via env `AUTUMN_ENV` / separate self-hosted instances or logical partitions for **preview** vs **local** when feasible. **Never** run webhook forwarders from two laptops against one customer without event id dedupe table. Document: local dev uses **test cards only**; org slugs include `dev-{user}` suffix **Proposed** optional. Production keys and prod `AUTUMN_API_BASE_URL` forbidden in `.env.local`.

### How will dashboard plan or feature changes be validated against application constants before deployment?

**Proposed (v1 default):** Repo holds **`AUTUMN_FEATURE_IDS`** constants (`org_storage_bytes`, `ai_usage_credits`, `organization_count`) in `@packages/billing`. CI script **`pnpm billing:validate-autumn`** (future) calls Autumn API read-only and asserts IDs exist and plan grants match expected **2 GB / 5 GB** byte grants. Deploy checklist: dashboard change + constant PR together. Mismatch fails CI, not runtime silent drift.

### How will customer binding avoid duplicate Autumn customers if creation succeeds remotely but the local request fails?

**Proposed (v1 default):** Org create uses **idempotency key = `organization_id`** (UUID from BA) on Autumn customer create. On local failure after remote success, **retry binding** reads by org metadata / idempotency and **upserts** `autumn_customer_id` on org entitlement row. Unique DB constraint on `autumn_customer_id`. If org row exists without customer, background **repair job** completes bind ([organizations.md](./organizations.md) create flow step 5).

### What are the recovery and alerting rules when Autumn is unavailable or entitlement synchronization repeatedly fails?

**Proposed (v1 default):** **Runtime:** Upload and AI gates use **DB cache only** — no synchronous Autumn `check` on hot path (**Approved**). **Purchase/upgrade** UI shows error if Autumn API down; no cache mutation. **Sync failure:** after **15 minutes** without successful webhook/reconcile, set internal flag `entitlements_degraded=true` (**optional expose to owner banner**). After **24h** without sync, **deny new uploads and AI invokes** (fail-safe); reads continue. **Alert:** Pager on webhook error rate &gt; 5% / 15m and reconcile job failure. Recovery: manual reconcile + clear flag.

---

## Organization roles and RBAC

_Normative:_ [org-roles-rbac.md](./org-roles-rbac.md).

### How will direct Better Auth endpoints enforce the same role restrictions as the application’s oRPC procedures?

**Proposed (v1 default):** **Product mutations** (billing purchase, storage grants, invites) go through **oRPC only**, not raw BA org APIs from clients. BA organization plugin endpoints used for **create org, list memberships, set active org** — wrap or hook in `@packages/better-auth` to call shared **`requireOrgRole`** before dangerous BA calls where exposed. **Rule:** Any HTTP route that mutates billing, grants, or invites must call the same **`requireOrgRole("owner")`** helper as oRPC. BA client methods not exposed for owner-only actions in v1 UI.

### Can an owner promote another member to owner, demote themselves, or transfer ownership while another ownership change is in progress?

**Approved stub:** Transfer only owner; target must be member ([organizations.md](./organizations.md)). **Proposed:** **Single-flight lock** per org on ownership mutations (`ownership_transfer_in_progress` or DB advisory lock). Concurrent transfers → **409** `org.ownership_conflict`. **Promote to owner:** allowed only via **transfer** flow in v1 (no dual-owner) **Proposed** unless BA supports co-owners — **one owner** at a time. Owner cannot demote self without completing transfer to another member.

### How will the system ensure an organization never loses its last owner during role changes, account deletion, or concurrent requests?

**Proposed (v1 default):** DB constraint or transaction: **count(owners) >= 1** on commit. Block remove/downgrade last owner with **403** `org.last_owner`. **Owner leave** blocked until transfer (**Approved** deferral in org doc). Account deletion of sole owner: **defer** org dissolution — block delete or force transfer ([account-data-retention-deletion.md](./account-data-retention-deletion.md) cross-cut).

### How quickly must role changes and membership removal invalidate existing sessions and authorization caches?

**Proposed (v1 default):** **Immediate on server:** next oRPC call loads membership from DB (no long-lived role cache in v1). **Session active org** unchanged on remove unless removed user’s active org was that org — then **clear active org** and return `auth.no_active_org` on next org-scoped call. **Target: &lt; 1 request** latency for revocation. **Optional:** BA session refresh hook on role change. React Query: client invalidates org caches on known mutations; **403** on stale tab handled by error boundary.

### How long-running operations behave if the user loses membership or permissions after the operation starts?

**Proposed (v1 default):** **Multipart upload / long poll:** each chunk re-validates membership + grant + org on **`initUpload`**, **complete**, and signed URL issuance — mid-upload revoke causes **403** on complete. **AI hold** (future): settlement allowed if hold valid at start; new chunks denied. **Billing checkout:** Autumn session tied to user who started; **owner check** on return URL handler regardless of mid-flight role change (non-owner → deny attach).

### Are billing reads, invoice downloads, portal links, and checkout callbacks all checked server-side for the current owner?

**Approved:** Billing tab **hidden** for non-owners; mutations **owner only** ([org-roles-rbac.md](./org-roles-rbac.md) R3, R7). **Proposed:** **All** billing routes including read invoices, portal URL minting, and checkout webhooks that attach plan to org verify **`requireOrgRole("owner")`** or webhook HMAC without user session but **scoped to `organization_id`** from trusted payload. Non-owner direct URL → **403** `rbac.forbidden`. Managers/members never receive invoice list APIs.

### How will storage activity and search avoid revealing names or metadata of files outside a member’s grants?

**Approved:** Owner sees all; others grant-scoped ([storage-system.md](./storage-system.md)). **Proposed:** Activity feed query joins grants + owner bypass; **no** events for paths user cannot list. Search indexes **only items visible to requester** (same predicate as `storage.list`). Denied resources omitted, not redacted placeholders. Cross-org → **403**.

### How will authorization be enforced for background jobs, webhooks, and internal service calls that have no user session?

**Proposed (v1 default):** Cron purge, reconcile, outbox workers run as **system principal** with **explicit `organization_id`** per row processed; **no user impersonation**. Webhooks: verify signature, map customer → org, apply policy table. Internal calls must pass **`service_token`** or run in-route with **scoped org id** from job payload — never “global admin write” without Console audit. Storage purge: only `loftlancer/orgs/{orgId}/` paths from DB rows.

### How will permission checks distinguish a member’s direct grant from a role-based grant after their role changes?

**Approved (v1):** Grants are **user grants** to folders/items; manager/member identical ([storage-system.md](./storage-system.md)). **Proposed:** Grants keyed by **`user_id`**, not role; role change does **not** auto-expand/contract grants — owner must revoke manually (**grants on member remove TBD** — **Proposed:** revoke all grants for removed `user_id` on membership delete). **No role-based grants in v1** schema.

---

## Organizations

_Normative:_ [organizations.md](./organizations.md).

### Does the one-organization limit count organizations a user created, currently owns, or merely belongs to?

**Approved:** Free **`organization_count` = 1 per user** ([organizations.md](./organizations.md) O7). **Proposed (v1 default):** Limit counts **orgs where user is owner** (creator becomes owner). **Belonging** to another org’s team does **not** consume the slot. Invited user with zero owned orgs may still **own one** after leaving employer org.

### Which plan determines a user’s ability to create another organization when plans belong to organizations?

**Proposed (v1 default):** **User-level create gate** uses **Autumn user customer** or aggregated **owned-org count** in DB — **not** the new org’s plan. **Paid subscription on org A does not** grant a second free create slot in v1 unless product amends. Second org requires **upgrade user feature** or **paid org slot** product **Proposed future**; v1 hard cap **1 owned org on Free**.

### How will concurrent creation requests enforce the limit atomically?

**Proposed (v1 default):** Serializable transaction or **`SELECT … FOR UPDATE`** on user’s owned-org count row before BA `createOrganization`. Second concurrent request fails **403** `entitlement.org_limit`. Mirror increment to Autumn `organization_count` **after** commit via async track (repair if fails).

### How will creation recover if the organization exists but its storage root, entitlement cache, or Autumn customer was not created?

**Proposed (v1 default):** Persist **`org_provisioning_step`** enum on org or job table: `created`, `storage_root`, `entitlement_cache`, `autumn_bound`, `complete`. **Idempotent workers** resume from last step. UI shows **“Finishing setup…”** until `complete`. Owner may use org switcher; Storage/Billing tabs blocked until `entitlement_cache` + `storage_root` done. Admin repair endpoint **Proposed** for ops.

### Can an invitation be accepted only by the intended verified email address, and what happens if the user signs in with a different account?

**Proposed (v1 default):** Invite token bound to **`email` + org_id + role**; accept requires session user’s **verified email matches** invite email — else **403** `org.invite_email_mismatch`. Wrong account may sign out / switch account UX. No accept by user id alone.

### How will expired, revoked, duplicated, or already-used invitations behave?

**Proposed (v1 default):** Single-use token with **`expires_at` (7 days default)**. States: `pending`, `accepted`, `revoked`, `expired`. Second accept → **410** `org.invite_used`. Owner revoke → **403** on accept. Re-send creates **new token**, invalidates old **Proposed**.

### Can an invitation assign the owner role, and does accepting it bypass ownership-transfer rules?

**Proposed (v1 default):** Invitations may assign **member or manager only** in v1 — **not owner**. Ownership change **only** via **transfer** flow with sole-owner lock ([RBAC section](#can-an-owner-promote-another-member-to-owner-demote-themselves-or-transfer-ownership-while-another-ownership-change-is-in-progress)).

### What happens when invitation delivery fails, or the owner resends or cancels an invitation?

**Approved:** Email transport Resend when available ([organizations.md](./organizations.md) O9). **Proposed:** Delivery failure → invite stays `pending`, owner sees **send failed** with retry; no membership until accept. Resend = new token. Cancel = `revoked`.

### When a member is removed, which organization becomes active in each existing session and browser tab?

**Proposed (v1 default):** If active org == removed org, **clear active org** server-side on remove; next request **`auth.no_active_org`**. Client switcher prompts pick another membership or create CTA. Other tabs get **403** on org-scoped fetch and shell forces picker. **Not** auto-switch to another org without user choice **Proposed**.

### How will switching organizations prevent in-flight requests and cached responses from displaying data from the previous organization?

**Proposed (v1 default):** On `setActiveOrganization`, client **aborts in-flight** org-scoped requests (AbortController) and **invalidates** React Query keys namespaced by `organizationId`. Server includes **`X-Organization-Id`** echo in responses; client drops mismatch. oRPC always derives org from **session**, not client header alone.

### What happens to the creation limit when ownership is transferred or an owner’s account is deleted?

**Proposed (v1 default):** **`organization_count`** tied to **owner user id**. Transfer: old owner **-1** owned count, new owner **+1** (may block if new owner already at limit). Delete owner account: **defer** — require transfer or org dissolution amendment; until then block delete.

### How will existing users and sessions be migrated when organization support is introduced?

**Proposed (v1 default):** One-time migration job: each user without membership gets **optional** “Create your organization” empty state — **no auto-org**. Existing personal data (avatars) unchanged. Sessions gain `activeOrganizationId=null` until user creates org (subject to count limit) or accepts invite. No retroactive Autumn customers until user creates org.

---

## Storage system

_Normative:_ [storage-system.md](./storage-system.md).

### How will public personal avatars and private organization files share one Blob store when Vercel sets access at the store level?

**Approved:** **One Vercel Blob store**; separation by **prefix / ACL / signing**, not multiple stores ([storage-system.md](./storage-system.md) Q4). **Proposed (v1 default):** Configure store for **public read at CDN** where required; **personal avatars** use `put` with `access: 'public'` under `loftlancer/avatars/` ([profile-avatar-blob.md](./profile-avatar-blob.md)). **Org hub files** use **`access: 'private'`** (or vendor equivalent) under `loftlancer/orgs/{orgId}/`; **no anonymous org URLs** ([storage-system.md](./storage-system.md) R6). **Access path:** oRPC verifies grant/owner → mint **short-lived signed URL** (TTL **1 hour**). Org avatars: **signed URL for members** or **dedicated public pathname** `loftlancer/orgs/{orgId}/avatar/*` **Proposed** with **only** latest avatar object at that path — still **not** listing other org files; owner/settings UI uses same path pattern ([storage-system.md](./storage-system.md) R7).

### How will concurrent uploads reserve quota atomically, including requests that are still uploading?

**Proposed (v1 default):** `initUpload` in transaction: `pending_bytes = sum(byte_size where status in ('active','pending_upload','trash'))` + **sum(pending reservations)**; if `used + file_size > quota_bytes` → **403** `quota.storage_exceeded`. Insert `org_storage_reservation` (`id`, `org_id`, `byte_size`, `expires_at` **1h**) or item `status=pending_upload`. **Complete** converts to `active` and clears reservation. Expired reservations released by cron.

### Do pending uploads, trashed files, and replaced avatars count toward quota until their blobs are deleted?

**Approved:** Hard cap at org level ([storage-system.md](./storage-system.md) Q7). **Proposed:** **Active + pending_upload + trash** count toward `quota_bytes` until **purge** (`del` blob). **Personal avatars** excluded. **Org avatar replace:** old object → `trash` or immediate `del` per policy — counts until purged (**Proposed:** trash old org avatar blob on replace to simplify quota).

### What happens if Blob upload succeeds but the metadata transaction fails, or metadata is committed but Blob deletion fails?

**Proposed (v1 default):** **Order:** reserve quota + insert `pending_upload` **first**, then `put` blob, then **commit** metadata `active` in one transaction. Upload failure → release reservation. **Blob without metadata:** nightly **orphan sweep** lists blob prefixes vs DB; delete unreferenced org blobs older than **24h** (never `loftlancer/avatars/`). **Metadata delete without blob `del`:** purge worker **retries `del`** with idempotent pathname; DLQ after N tries; **403** list still hides purged metadata.

### How will interrupted uploads, orphaned blobs, and stale pending records be discovered and cleaned up?

**Proposed (v1 default):** Cron: expire `pending_upload` &gt; **24h** → release reservation + optional `del` if pathname known. Orphan sweep above. Metrics: `storage.orphan_blob_count`, `storage.stale_pending`.

### How will folder grants inherit, and what access changes when a file or folder is moved?

**Proposed (v1 default):** Grants attach to **folder_id** or **item_id** only — **no inherit to children** in v1 unless grant row on folder implies **subtree access** via query: “user has grant on folder or ancestor” (**Proposed:** **explicit subtree flag** on folder grant `includes_descendants=true` default **true**). **Move file:** grants on item move with item; **move folder:** grants on folder id unchanged. Member loses access if moved out of granted subtree.

### Can a member with access to a nested file discover its parent folders without seeing unrelated contents?

**Proposed (v1 default):** `storage.list` returns **only granted subtrees**; **breadcrumb** API returns **ancestor chain names** for visible item without listing sibling folder contents — minimal metadata (id, name) for path context. No leakage of sibling file names (**403** if item not visible).

### Can a signed URL still be used after membership or a grant is revoked, and is its one-hour lifetime acceptable?

**Approved:** TTL **1 hour** ([storage-system.md](./storage-system.md) R7). **Proposed:** **Yes**, URL may work until expiry (vendor constraint) — acceptable v1 risk. **Mitigation:** shortest practical TTL; **optional Proposed v1.1:** signed URL embeds `user_id` + HMAC verified at edge proxy. Revoke does not invalidate outstanding URLs until TTL. Document in security section.

### What happens when restore and automatic purge run at the same time?

**Proposed (v1 default):** Row-level **lock** on item; **restore wins** if user initiates restore before purge transaction commits; purge skips rows with `restore_requested_at`. Purge job uses `WHERE trashed_at < now() - 7d AND status='trash' FOR UPDATE SKIP LOCKED`.

### Can a user restore a file when the organization is already over quota, or when its original folder no longer exists?

**Proposed (v1 default):** **Over quota:** **deny restore** if `used + file_size > quota_bytes` → **403** `quota.storage_exceeded`. **Missing folder:** restore to **org root** (or nearest existing ancestor) with activity `storage.restore_relocated`.

### How are folder deletion, recursive trash, partial restoration, and the seven-day retention period defined?

**Approved:** **7-day** trash then purge ([storage-system.md](./storage-system.md) Q8). **Proposed:** **Folder delete** → recursive `status=trash` on descendants; **no partial folder restore** in v1 if parent purged — restore leaf items only if parent exists. Retention clock from **`trashed_at`**. Owner may **empty trash** early.

### How will folder moves prevent cycles and enforce the maximum depth for every descendant?

**Approved:** Max depth **5** ([storage-system.md](./storage-system.md) R7). **Proposed:** Move validates **new depth + subtree height ≤ 5**; reject cycle (`folder_id` not under descendant). Transactional update of `parent_id`.

### How are duplicate file and folder names handled during upload, rename, move, and restore?

**Proposed (v1 default):** Unique **`(organization_id, folder_id, display_name)`** among `active` items; conflict → **409** `storage.name_conflict`. Upload auto-suffix **" (1)"** **optional UX** — server may reject strict. Rename/move same rules.

### How will the server validate actual file content, including Office documents that use ZIP containers, rather than trusting the supplied MIME type?

**Approved:** MIME allowlist + magic-byte checks ([storage-system.md](./storage-system.md) Security). **Proposed:** Sniff first **512 bytes** / use `file-type` library; for OOXML, verify **ZIP local header** and `[Content_Types].xml` content type matches allowlist entry. Reject mismatch **400** `storage.invalid_content`. Client-declared MIME is hint only.

### How will files be served safely to prevent active content and unsafe filenames from affecting the application?

**Proposed (v1 default):** Signed URLs use **`Content-Disposition: attachment`** default for download; **inline** only for image/PDF allowlist. **Sanitize `display_name`** for headers (strip path, control chars). **CSP** on Account app; no `text/html` uploads in allowlist. **X-Content-Type-Options: nosniff** on proxy responses.

### Can an organization avatar be displayed to users without storage grants, and does that expose other private files?

**Approved:** Org avatar path `loftlancer/orgs/{orgId}/avatar/` ([storage-system.md](./storage-system.md) R7). **Proposed:** **Org avatar** visible to **all org members** (membership check only, no folder grant) via signed URL or controlled public pathname **only under `…/avatar/`** — does **not** expose other prefixes. Non-members: **403**. No directory listing at store level.

### How will the purge job handle retries, overlapping runs, and provider outages without deleting the wrong object?

**Approved:** Vercel Cron secured route; `del` org prefixes only ([storage-system.md](./storage-system.md) R5). **Proposed:** **Advisory lock** `purge_job` per env; **SKIP LOCKED** rows; **verify `blob_pathname` matches** `loftlancer/orgs/{orgId}/` before `del`. Retry **3x** exponential; never delete `loftlancer/avatars/`. Overlapping runs: second exits early if lock held.

### Should the interim 5 GB limit apply to Free organizations whose approved quota is 2 GB?

**Approved:** Interim **5 GB constant** until Autumn → DB sync; production plan sync must use **2 GB Free / 5 GB Paid** ([storage-system.md](./storage-system.md), [autumn-usage-metering.md](./autumn-usage-metering.md)). **Proposed:** Interim constant is **dev/MVP convenience only** — **do not** ship production Free orgs on 5 GB. Tests use feature flag `USE_PLAN_QUOTA_SYNC`; when false, document that **all orgs get 5 GB** temporarily. Billing sync slice **replaces** constant before paid launch.

---

## Cross-plan verification

_Normative map:_ [platform-entitlements-plan.md](../platform-entitlements-plan.md).

### Which integration tests will cover organization switching, permission revocation, concurrent quota use, billing events, and recovery from partial failures?

**Proposed (v1 default):** **Integration test matrix (not exhaustive unit tests):**

| Scenario                | Assertion                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| Org switch              | Data from org A not visible after switch to B; in-flight aborted |
| Grant revoke            | Member loses list access next request; signed URL may work ≤1h   |
| Concurrent `initUpload` | Two 3MB files near cap — one succeeds, one **403**               |
| Webhook idempotency     | Duplicate `event_id` unchanged cache                             |
| Partial org create      | Worker completes storage root + Autumn bind                      |
| Credit hold replay      | Same idempotency key no double debit                             |
| Cross-org id            | **403** `rbac.cross_org`                                         |

Run against **test DB + Autumn test project**; no production Stripe.

### What metrics and alerts will identify failed provisioning, stale entitlements, quota drift, failed purges, and billing reconciliation errors?

**Proposed (v1 default):** Metrics listed above plus: `org.provision_incomplete`, `billing.webhook_failures`, `storage.purge_failures`, `entitlements.sync_age_seconds`. Alerts: sync age **&gt; 24h**, provision stuck **&gt; 30m**, purge DLQ **&gt; 0**, Autumn drift **&gt; 1%** orgs. Dashboard links from [platform-entitlements-plan.md](../platform-entitlements-plan.md) §4.12.

### Which slices can safely ship independently without exposing incomplete authorization, incorrect quotas, or inaccessible billing flows?

**Approved sequencing:** Org before storage ([storage-system.md](./storage-system.md) R1); organization before autumn customer scope. **Proposed slice independence:**

| Slice                               | Safe alone?                        | Conditions                                |
| ----------------------------------- | ---------------------------------- | ----------------------------------------- |
| BA org + switcher                   | **Yes**                            | No storage/billing until active org works |
| RBAC middleware                     | **Yes** after org                  | Deny-by-default on org routes             |
| Entitlement schema + Free bootstrap | **Yes** with org create            | 2 GB cache on create even before Autumn   |
| Autumn webhooks + sync              | **No** without org customer ids    |                                           |
| Storage read-only overview          | **Yes** after org + schema         | Interim quota constant flagged            |
| Storage upload                      | **No** without grants + quota      |                                           |
| Billing UI purchase                 | **No** without Autumn + owner RBAC |                                           |
| AI helpers                          | **Yes**                            | **No routes** — no user exposure          |

**Rule:** Never ship **upload** or **billing purchase** without **owner RBAC + entitlement cache + org context** on same deploy train.

---

## Additional implementation guidance

The following is **proposed**, subject to the blockers above and any required requirements amendment. It does not approve new product behavior or expand the v1 AI scope.

### AI request lifecycle and accounting

- Model a request with explicit `held`, `in_flight`, `settled`, `released`, and `unknown` states. Define allowed transitions and use conditional updates so only one worker can settle or release a hold.
- A timeout, lost response, or expired worker lease does not prove that the provider did not process a request. Preserve the hold in `unknown` until provider reconciliation or an explicit resolution policy determines the outcome; never automatically retry an uncertain provider call without a verified idempotency guarantee.
- Bind an idempotency key to the organization, operation, user or permitted actor, and a hash of the normalized request. Reject reuse with a different payload and define what authorized callers can retrieve on replay. Do not persist prompts or outputs merely to support replay without a retention and access policy.
- Record immutable debit, hold, release, purchase, refund, and adjustment events with unique source references. Define the authoritative balance calculation and the exact watermark or event set reflected in each Autumn snapshot before applying synchronization.
- Write settlement and any required outbox record in the same database transaction. Define repair for failed deliveries, replay after recovery, refunds received while usage is pending, and manual adjustments with an audit trail.
- Test concurrent spends, duplicate requests with different payloads, crash boundaries, delayed provider success, worker lease expiry, partial responses, and late purchase or refund events before enabling an invoke route.

### Billing event processing and operations

- Verify the actual Autumn event contracts and signature mechanism for the installed integration. Persist a verified event before acknowledging it, process it idempotently, and retain enough identifiers to trace each change without storing unnecessary payment data.
- Use an authoritative provider revision or fetch current state when ordering cannot be proven; a received timestamp or an unrelated local sync timestamp alone is not a reliable subscription version. Define handling for equal timestamps and events that cannot be mapped to an organization.
- Keep separate timestamps for the last event received, last successful authoritative fetch, and last successful local application. A quiet webhook stream is not evidence of failure. Establish one approved staleness threshold and fail-safe policy per capability.
- Bind checkout state to the initiating organization and a one-time server-side nonce. Recheck the current owner for user-facing actions; process verified provider events as system events even if the initiating user's role has changed. Never treat a client return URL as proof of payment.
- Define ownership, runbook, and access for manual reconciliation, dead-letter replay, billing corrections, and alert escalation. Record operator actions and ensure repairs are scoped to one environment and customer.
- Test missed and reordered events, a customer binding race, a successful checkout with a delayed event, a refund during a pending debit, an outage, and recovery after the deployment or worker restarts.

### Organization membership and authorization

- Guard every mutation entry point, including direct Better Auth endpoints, rather than relying on which client methods the UI exposes. Inventory the enabled endpoints and test owner, manager, member, removed member, and platform-admin behavior against the same policy.
- Serialize ownership changes and enforce the last-owner invariant in the database transaction. Specify target acceptance, concurrent transfers, transfer cancellation, and whether ownership counts toward the recipient's creation limit before shipping transfer.
- Scope invitation tokens to the intended organization, verified recipient, role, expiry, and single use. Prevent replay after revocation and validate acceptance atomically against concurrent removal, re-invitation, and role changes.
- Recheck membership and authorization at the point of a sensitive commit, not just when a long-running request begins. Define which in-flight provider or upload operations may complete after revocation.
- For organization switches, partition cached data by organization and avoid applying late responses to another org's view. Verify server session behavior across tabs and concurrent switches; a client-provided org identifier must never independently authorize access.

### Storage consistency and security

- Resolve the public/private Blob store conflict before implementation. Compare a separate private store with a private-only store plus an explicitly authorized public-avatar delivery mechanism; record migration, credential, availability, cost, and existing-avatar compatibility effects before amending the approved single-store decision.
- Reserve bytes under an organization-scoped lock or equivalent atomic update. Pending metadata and a separate reservation must represent one allocation, not two. Define exact byte units, reservation expiry, size verification at completion, and cleanup after worker failure.
- If trash counts toward usage, restoring an existing item changes its status without adding its bytes again. Define whether restore is allowed while already over quota as a separate product policy.
- Use a deletion state machine that preserves the blob pathname and retry information until provider deletion succeeds. Serialize restore against the point at which irreversible blob deletion begins; a database row lock cannot roll back an already completed external deletion.
- Validate folder moves against cycles, descendant depth, destination permissions, and grants that become effective at the new location. Define behavior for direct item grants and already-issued signed URLs after moves or revocation.
- Bound upload request size before buffering; validate file contents and ZIP container limits, protect against decompression bombs, sanitize download filenames, and define safe content-disposition and caching behavior. Decide whether malware scanning is required before files become accessible.
- Test independent organizations, role changes during upload, quota races, storage provider failures, restore/purge races, malicious files, inherited grants, and orphan cleanup against a non-production store.

### Rollout, migrations, and support

- Roll out schema changes with backward-compatible migrations and a rollback plan. Backfill organization roots and entitlement records idempotently; verify counts and expose incomplete provisioning for repair.
- Separate deploy readiness from product availability: an upload path requires working tenancy, grants, quota, private delivery, and recovery; billing purchases require verified customer binding, owner authorization, and event processing.
- Maintain a contract matrix for each feature: authoritative source, local cache, update trigger, stale behavior, retry mechanism, owner-visible state, and operational alert.
- Define structured, redacted logs and correlation IDs across the request, organization, provider event, and background job. Protect prompt content, payment data, invitation tokens, and signed URLs from logs.
- Add operational drills for webhook backlog, stale caches, provider outage, partial provisioning, failed purge, and database restore. Record the recovery owner and a safe way to replay each job.

---

## Document control

| Version | Date       | Change                                                       |
| ------- | ---------- | ------------------------------------------------------------ |
| 0.1     | 2026-11-14 | Initial design answers for entitlements Q&A batch            |
| 0.2     | 2026-11-14 | Addendum: self-hosted Autumn OSS + deferred AI Gateway slice |

**Workflow:** [../../workflow/04-requirements-first.md](../../workflow/04-requirements-first.md) — amend individual requirements docs if any **Proposed** default becomes binding product law.
