# Requirements: Failed sign-in attribution and page-visit collection

**Status:** **Partial approval** (2026-11-14 batch) — failed-sign-in (**F2**) and page-visit (**P0**) preferences recorded below; **full doc not approved** until user says **“approved”** (no implementation until full sign-off + **go implement**; no user-feed failed-sign-in slice)  
**Approved by:** _(full sign-off pending)_ — partial choices recorded 2026-11-14 (chat)  
**Layers:** packages / modules / apps  
**Roadmap:** Phase 7 — [auth-account-roadmap.md](../auth-account-roadmap.md) (“Decide failed-sign-in attribution and page-visit collection; do not guess owners”) — **checkbox stays unchecked** until full sign-off here  
**Related:** [application-activity.md](./application-activity.md) · [session-activity-location.md](./session-activity-location.md) · [activity-and-logging.md](../../modules/activity-and-logging.md) · [api-structure.md](../../modules/api-structure.md)

## Goal

Record **approved product policy** for:

1. **Failed sign-in attribution** — when a sign-in attempt fails before a session exists, whether and how it may appear in the signed-in user’s **Login & Security Activity** feed (`activity_event`, owner-scoped).
2. **Page-visit collection** — whether routine navigation (page views, shell clicks, timeline “open destination” navigation) is recorded as activity history, and what counts as a **meaningful observed operation** vs noise.

**No implementation** in this pass: no new `actionId`s, hooks, migrations, client recording endpoints, or UX promises beyond what policy approves. **`ownerUserId` must never be inferred from client input, unverified email, or heuristics** without an explicit approved server-side rule documented below.

## User-facing tension (resolve at sign-off)

| Source                                                                    | Says                                                                                                                                      |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [session-activity-location.md](./session-activity-location.md) (approved) | Login & Security Activity should include **observable failed sign-in attempts** when available.                                           |
| [application-activity.md](./application-activity.md) + runtime            | Failed sign-in rows are **intentionally omitted** when no verified owner exists; only successful `auth.sign_in` is recorded.              |
| [application-activity.md](./application-activity.md) §3                   | Clicking a timeline row navigates with `?activityId=` and opens a detail popover — **UI only**; not defined as a new activity occurrence. |
| [activity-and-logging.md](../../modules/activity-and-logging.md)          | Failed anonymous sign-ins **cannot** be attributed to an owner without verified identity; do not infer actions from UI clicks alone.      |

This doc chooses policy so implementation, copy, and tests align — without guessing owners.

## Current runtime (evidence — do not change without approval)

### Activity schema contract

- Every `activity_event` row requires **`ownerUserId`** (whose history lists the event). Feeds are **owner-scoped** (`security.activity.feed`, clear, detail).
- `beginActivity` / `recordActivity` reject missing `ownerUserId` ([`activity.service.record.ts`](../../../modules/activity/src/server/services/activity.service.record.ts)).
- Registered auth success action: **`auth.sign_in`** only among sign-in-related IDs ([`activity.actions.ts`](../../../modules/activity/src/utils/config/activity.actions.ts)); there is **no** `auth.sign_in_failed` (or equivalent) today.

### What is recorded today

| Event                                                      | Trigger                                       | Owner               | Notes                                                                                                                                                                       |
| ---------------------------------------------------------- | --------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.sign_in`                                             | Better Auth `session.create` **after** hook   | `session.userId`    | IDs reserved in **before** hook; IP/UA from new session ([`security.auth-database-hooks.ts`](../../../modules/security/src/server/shared/security.auth-database-hooks.ts)). |
| `auth.sign_out`, `auth.session.revoke`, `auth.session.end` | `session.delete` hooks                        | Session user        | Path-dependent type.                                                                                                                                                        |
| `security.provider.link`                                   | OAuth link when session matches account owner | Verified owner      | Documented in [application-activity.md](./application-activity.md).                                                                                                         |
| Profile, preferences, location, etc.                       | Domain server boundaries                      | Authenticated owner | Transactional where applicable.                                                                                                                                             |

### What is **not** recorded today

- **Failed** sign-in (wrong OAuth denial, invalid magic link, SSO/email mismatch, aborted social redirect, etc.) — **no** `activity_event` row.
- **Pre-session** attempts where the server has not established a **verified** user id bound to the attempt.
- **Page visits** or **every navigation click** — no producer; unified activity targets **mutations and server-observed auth lifecycle** only.
- **Timeline destination navigation** (`?activityId=` highlight) — **no** `recordActivity` in destination/highlight client code.

### Diagnostic logging (separate from activity history)

Better Auth HTTP handlers run under `withRequestLogging("auth", "auth", …)` ([`better-auth.handlers.ts`](../../../packages/better-auth/src/integration/better-auth.handlers.ts)). Failed auth may appear in **platform logs** with bounded redaction; that is **not** the user-visible Login & Security feed and is **not** owner-attributed history unless policy here explicitly bridges them (not proposed by default).

### Sign-in surfaces (inventory for coverage questions)

Observed entry paths in the auth app (each may fail **before** `session.create`):

- Social OAuth (Google, GitHub) via Better Auth client.
- Magic link (Better Auth plugin).
- SSO (`signInWithSso` / organization SSO).

**Open for implementation investigation (not decided here):** which Better Auth callbacks or HTTP paths expose **verified** `userId` on failure vs only an identifier string — agents **must not** assume email→user lookup is safe or enumeration-neutral.

## In scope (this requirements pass)

- [x] Document current recording gaps and owner-scoping rules.
- [x] Define **option sets** for failed sign-in attribution and page-visit collection.
- [x] List **blocking** product/security questions.
- [x] User preference on one option per topic — **F2** + **P0** — **2026-11-14 batch** (partial; sign-off bundle still open).
- [ ] Full doc sign-off (**“approved”**) + remaining open questions resolved.
- [ ] Record full approval in **Approved by**; **then** user may say **go implement** (diagnostics-only slice for failed sign-in if needed — **no** `activity_event` rows).

## Out of scope

- Implementing hooks, new tables, admin security dashboards, or rate-limit/IP blocklists.
- Account-existence UX changes (uniform error messages) unless bundled with an approved attribution option.
- Enterprise SIEM, separate `unattributed_*` stores, or cross-user security analytics — require their own requirements if needed.
- Retention of failed-attempt data ([account-data-retention-deletion.md](./account-data-retention-deletion.md) and clear-history semantics apply once events exist).

---

## Decision 1 — Failed sign-in attribution

**Principle:** `ownerUserId` is set only when the server has a **verified binding** between the attempt and an existing user row **without** using rules that increase account enumeration risk beyond what sign-in already exposes. If no such binding exists at the authoritative boundary, **do not** insert an owner-scoped `activity_event` row.

### Option F0 — Status quo (recommended default until user chooses otherwise)

- **Feed:** No failed sign-in rows in Login & Security Activity.
- **Diagnostics:** Auth request logging only (existing handler logging); no new fields.
- **Copy:** Login & Security Activity describes **server-observed** events; failed attempts are **not** listed in the feed (F2). UI copy states operator-only logging (2026-11-15).
- **Pros:** No owner guessing; no enumeration surface from history backfill.
- **Cons:** Mismatch with original session-activity wording until copy or policy updates.

### Option F1 — Failed attempts only when `userId` is already verified server-side — **withdrawn (2026-11-14 batch → F2)**

Record `auth.sign_in_failed` (new action id — **name TBD at implementation**) **only** when **all** are true at the failure boundary:

1. Better Auth (or app middleware) returns a **canonical user id** for the attempt (same trust level as `session.userId` on success — **not** client-supplied).
2. The failure is classified (e.g. `denied`, `failed`, `error`) from an observable server outcome.
3. Metadata is allowlisted (e.g. `providerId`, `method`, `path`) — **no** raw email in `activity_event` unless explicitly approved in metadata schema.

**Owner:** that verified `userId`. **Actor:** `{ type: "user", userId }` or `system` per hook context.

**Requires sign-off sub-choices:**

- [ ] Exact failure modes in scope (OAuth callback error vs magic-link expired vs SSO no membership).
- [ ] Whether **signed-in user performing a second sign-in** failures count (rare).
- [ ] Outcome vocabulary alignment with existing `activity.events.schema` (`failed` vs `denied`).

**Pros:** Delivers approved UX for “my failed attempts” when identity is known.  
**Cons:** Still **no** coverage for anonymous spray; requires hook/API survey per path.

### Option F2 — Defer user feed; security diagnostics only — **chosen (2026-11-14 batch)**

Same as F0 for `activity_event`, but **structured diagnostic** events (e.g. `auth.sign_in.failed` log line with `activityId` correlation, **no** `ownerUserId` in logs per [activity-and-logging.md](../../modules/activity-and-logging.md) norms) for operators.

**Recorded preference (2026-11-14 batch):** Failed sign-in attempts appear in **logs/diagnostics only** — **not** in the user’s Login & Security Activity feed. Supersedes prior **F1** preference.

**Pros:** Security visibility without owner attribution.  
**Cons:** Not visible in Account UI; retention is platform TTL (Phase 12).

### Option F3 — Unattributed / aggregate store (not recommended without legal review)

Separate storage or feed for attempts **without** `ownerUserId`. **Out of scope** for v1 unless user explicitly approves new schema and privacy review.

|                            | F0                | F1                               | F2          | F3        |
| -------------------------- | ----------------- | -------------------------------- | ----------- | --------- |
| User Login & Security feed | No failures       | Failures when user id verified   | No failures | Custom    |
| Owner required             | Yes when recorded | Yes                              | N/A         | Undefined |
| Enumeration risk           | Lowest            | Medium — must audit lookup rules | Low         | High      |

---

## Decision 2 — Page-visit and navigation collection

**Principle:** Activity history remains **account activity** (mutations + approved security events), not a full analytics stream. [application-activity.md](./application-activity.md): page-visit / every-click collection was **undecided**; implementation stayed with **meaningful observed operations**.

### Option P0 — Status quo (recommended default) — **chosen (2026-11-14, preference)**

- **Do not** record page views, shell tab changes, command-palette navigation, or timeline link clicks as `activity_event` rows.
- **Do** continue recording registered **server-observed** operations only.
- Timeline `?activityId=` navigation remains **presentation** (highlight + popover), not a new `actionId`.

### Option P1 — Record allowlisted **account section opens** (server-side only)

When an **authenticated** user hits specific Account routes (allowlist maintained server-side, e.g. `/account/security/sessions`), emit e.g. `account.navigation.view` with owner = session user, metadata = `{ target: "account.sessions" }`.

**Must:** Server derives owner from session on **GET/navigation boundary** (middleware or RSC server layout) — **not** a client `record` RPC.

**Requires sign-off:**

- [ ] Exact route allowlist (Account only vs Console/Studio).
- [ ] Volume/retention impact on clear-history UX.
- [ ] Whether opens repeat on every visit or dedupe per session/day.

### Option P2 — Record **activity destination** opens only

When user lands with `?activityId=` and server validates they may view that event, optionally record `activity.destination.view` linked by `correlationId` to the original event.

**Requires sign-off:**

- [ ] Whether this adds value vs noise.
- [ ] Deduping rules (same `activityId` per session).

### Option P3 — Broad page-visit / click stream

Client or edge emits events for most navigations/clicks.

**Rejected by default** unless user explicitly approves: conflicts with [activity-and-logging.md](../../modules/activity-and-logging.md) (no inventing actions from clicks), high volume, PII surface, client trust issues.

|                 | P0   | P1     | P2         | P3                       |
| --------------- | ---- | ------ | ---------- | ------------------------ |
| Feed noise      | Low  | Medium | Low–medium | High                     |
| Client-trusted  | No   | No     | No         | Yes (blocked by default) |
| New `actionId`s | None | Few    | One        | Many                     |

**Recorded preference (2026-11-14):** **P0** — no page-visit or navigation collection as `activity_event` rows.

---

## Architecture (after approval — not in this doc pass)

| Decision                   | Likely layer                                              | Notes                                                                                                                   |
| -------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Failed sign-in hook points | `@modules/security` + `@packages/better-auth` integration | Extend `buildSecurityAuthDatabaseHooks` only where Better Auth exposes verified identity on failure — **survey first**. |
| New action definitions     | `@modules/activity` `activity.actions.ts`                 | e.g. `auth.sign_in_failed`, `account.navigation.view` — names frozen at approval.                                       |
| Page-visit capture         | `apps/auth` server boundaries                             | Middleware or layout server hook; **no** new public “log click” oRPC.                                                   |
| UI / i18n                  | `@modules/activity` client                                | Filters, empty states, and Login & Security copy must match chosen options.                                             |

## End-to-end flows (target — illustrative)

### Failed sign-in (F2 — diagnostics only)

1. User attempts sign-in on Auth app; request fails at Better Auth without `session.create`.
2. Server logs structured diagnostic event per approved shape; **no** `activity_event` row.
3. Login & Security Activity **unchanged** — no failed-attempt rows for the account owner.

### Section view (only if P1 approved)

1. Authenticated user navigates to allowlisted Account URL.
2. Server boundary records one `account.navigation.view` (per dedupe rules).
3. Row appears under User Activity or a new category — **category choice requires sign-off**.

## Gaps / open questions

**Blocking sign-off:**

- [x] **Failed sign-in:** Choose **F0**, **F1**, **F2**, or **F3** — **F2** — **2026-11-14 batch** (supersedes F1).
- [ ] If diagnostics slice ships: which sign-in paths emit `auth.sign_in.failed` (or equivalent) in v1? (social / magic link / SSO.)
- [x] ~~F1 attribution rules~~ — **N/A under F2** (no owner-scoped feed rows).
- [ ] **Enumeration:** Should failed-attempt history be visible only to the owning user (current feed model) — confirm no admin/console feed implied.
- [x] **Page visits:** Choose **P0**, **P1**, **P2**, or **P3** — **P0** (none) — **2026-11-14** (preference).
- [ ] If **P1** or **P2:** Category (`account` vs `resource`), clear-history scope, and dedupe rules. _(N/A while **P0** — skip unless user reopens.)_
- [ ] **Copy alignment:** Update Login & Security / session-activity promises vs **F2** + **P0** (requirements-only note; i18n in implementation slice if needed).
- [x] **Sign-off bundle:** User confirms failed-sign-in option + page-visit option together — **F2** + **P0** — **2026-11-14 batch** (**partial**; not full doc **“approved”**).
- [ ] User says **“approved”** on the **full** requirements doc (remaining gaps above).
- [ ] User says **“go implement”** before any code slice (optional diagnostics enrichment only under **F2**).

## Implementation slices (after full sign-off + **go implement**)

**Not in progress (2026-11-14 batch):** preferences **F2** + **P0** recorded only — **no** user-feed `actionId`s, migrations, or client recording until full **“approved”** + **go implement**.

1. Record **Approved by**; check Phase 7 roadmap item **only** after user confirms this doc (**full** **“approved”**).
2. **F2 slice (optional, when approved):** Enrich structured diagnostics on failed sign-in paths — **no** `recordActivity` / `auth.sign_in_failed` in owner feed.
3. Update [application-activity.md](./application-activity.md) and [session-geolocation.md](./session-geolocation.md) implementation notes so UI does not promise failed attempts in Activity.
4. **P0:** no implementation — status quo retained; page visits tracked elsewhere later if product reopens (**deferred**, 2026-11-14 batch).

## Validation checklist (before sign-off)

- [x] Current runtime matches code references above
- [x] No owner attribution rule smuggles in unverified email or client ids
- [x] Options distinguish user feed vs diagnostic logs
- [x] User selected failed-sign-in option — **F2**, 2026-11-14 batch (diagnostics only).
- [x] User selected page-visit option — **P0**, 2026-11-14 (preference).
- [x] Roadmap checkbox remains unchecked until **full** doc **“approved”** (partial preferences do not check the box).
- [ ] User confirmed **full** sign-off recorded above.

## Approval

| Field                    | Value                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| Failed sign-in           | **F2** — **logs/diagnostics only**; **not** user Activity feed (supersedes F1)                         |
| Page visits              | **P0** — none (no page-visit / navigation `activity_event` rows; track later elsewhere if reopened)    |
| Partial choices recorded | **2026-11-14 batch** (user chat)                                                                       |
| Full doc status          | **Not approved** — say **“approved”** to complete; Phase 7 roadmap checkbox stays unchecked until then |
| **F2** implementation    | **Optional** diagnostics slice after full sign-off + **go implement** — no user-feed rows              |
| Approved by              | _pending full sign-off_                                                                                |
| Full approval date       | _pending_                                                                                              |
