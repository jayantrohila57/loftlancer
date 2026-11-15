# Requirements: Account data, Blob, and diagnostic-log retention

**Status:** **Implemented (2026-11-14)** — soft delete runtime + schema shipped per user directive; **formal sign-off still pending** on PII, activity/location, audit row, and bundle confirmation  
**Sign-off:** Deferred — tombstone, retention, and reactivation direction **implemented**; PII, activity/location, audit row, and bundle confirmation pending  
**Approved by:** _(pending — implementation override 2026-11-14)_  
**Layers:** packages / modules / apps  
**Roadmap:** Phase 6 — [auth-account-roadmap.md](../auth-account-roadmap.md) (“Decide retention/deletion policy for app data, Blob files, and diagnostic logs”) — **checkbox stays unchecked** until full sign-off here  
**Related:** [profile-avatar-blob.md](./profile-avatar-blob.md) (Blob **Option A** approved 2026-11-14) · [application-activity.md](./application-activity.md) · [activity-and-logging.md](../../modules/activity-and-logging.md)

## Goal

Record an **approved product policy** for what happens to **Postgres application data**, **Vercel Blob objects** (profile avatars), and **server diagnostic logs** when a user deletes their account or clears history—**without** schema migrations in this requirements pass.

Implementation (soft-delete schema, auth hooks, UI copy, ops runbooks, future Blob sweeps) happens only after explicit sign-off **and** user says **“go implement”**.

## User direction (2026-11-14 · refined batch)

**Account deletion policy = soft delete app-wide.** Do **not** hard-delete or CASCADE-wipe user/application data as the default outcome of the delete-account flow.

- **Intent:** Flag the user record as deleted via **`deletedAt`** on the `user` row (tombstone); **retain** application-owned rows keyed to that user unless a separate retention or purge policy applies later.
- **No cascade / hard delete (product default):** Related tables stay keyed to the tombstoned user; **no** app-wide hard delete or automatic child-row wipe on delete-account.
- **Retention:** **Indefinite** — keep soft-deleted rows until **manual purge** (ops/legal); no scheduled hard purge as product default.
- **Reactivation:** **Block** — **no restore** path; the **same email cannot sign up** again; signup/login surfaces show that the account was deleted.
- **UX (user-facing):** After explicit **consent** in the delete flow (typed confirmation — same pattern as other platforms), tell the user the account is **unusable** and messaging that their data was **“erased”** from a product perspective (access revoked, no self-service recovery) while data is **retained internally** per this policy.
- **Email:** Send the user a **last copy** of their data (export-style summary) as part of or immediately after successful delete — content scope and format TBD at implementation; direction recorded.
- **Sessions:** **Invalidated** on delete; user signed out — same security posture as today.
- **Not in scope for this direction alone:** Migrations, Better Auth hook changes, or switching runtime behavior from current hard delete.

### Supersedes (deferred — not default policy)

The prior **“delete with account” Postgres cascade** proposal is **deferred** and is **not** the target policy. It remains useful only as an inventory of what **would** disappear today if the `user` row were removed (see [Current runtime vs approved direction](#current-runtime-vs-approved-direction)).

## Decided (partial — confirm remaining questions at sign-off)

| Domain                          | Policy                                                                                                                                                                                                                                                                                                                                                                                                     | Implementation in this slice                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Application data (Postgres)** | **Soft delete only** — `user.deletedAt` set; **indefinite** retention until manual purge; related rows **retained** (no cascade/hard delete as default). UX: account unusable + retention-aware copy; **email last copy** to user (**deferred**). PII visibility and activity/location handling — [open](#gaps--open-questions). **No restore**; explicit consent on delete; same email blocked at signup. | **Shipped (runtime)** — migration `0012_user_soft_delete`, `user.additionalFields.deletedAt`, tombstone+session revoke transaction, account delete blocked except `/unlink-account`, session-create tombstone guard (+ DB fallback). **Verify:** `tests/auth-security-isolated-db.test.tsx`, `tests/security-soft-delete-plugin.test.tsx`, `tests/account-data-retention-policy.test.tsx`, `tests/security-account-deletion.test.tsx`. |
| **Blob files (avatars)**        | **Option A (inherited)** — no automatic `del` on account deletion, replace, or clear. Orphans remain until manual ops or a future approved Blob option (B–D in [profile-avatar-blob.md](./profile-avatar-blob.md)).                                                                                                                                                                                        | **None** — aligns with approved orphan policy; no hook on delete flow.                                                                                                                                                                                                                                                                                                                                                                 |
| **Diagnostic logs**             | **Option A — platform deferral (unchanged)** — account deletion does **not** purge log lines; completion is **not** stored as a retained `activity_event` row. Structured logs use correlation IDs only (`activityId`, `actionId`); production retention is set at the **log destination** during deployment (Phase 12), not in application code.                                                          | **None** in this doc pass — no erasure jobs, no new log fields.                                                                                                                                                                                                                                                                                                                                                                        |

## In scope (this requirements pass)

- [x] Inventory what account deletion removes **today** (hard delete + Postgres cascades) — reference for migration planning only.
- [x] Record **soft-delete** as user direction (2026-11-14).
- [x] Align Blob behavior with [profile-avatar-blob.md](./profile-avatar-blob.md) **Option A**.
- [x] Document diagnostic logging vs activity history for `security.account.delete` (unchanged).
- [x] List open questions blocking full sign-off.
- [ ] User sign-off on soft-delete details + Blob Option A + diagnostic Option A.
- [x] **Delete-account UI copy (Blob disclosure):** Skipped — no i18n change in this pass (2026-11-14).

## Out of scope

- Schema migrations, tombstone columns, auth hook rewrites, or changing delete runtime — until **go implement** after sign-off.
- Blob delete hooks — including Option B–D from [profile-avatar-blob.md](./profile-avatar-blob.md).
- Automated log erasure, per-user log redaction, or SIEM integration.
- GDPR/legal retention mandates — flag as product/legal input if required later.
- Phase 9 “data export” and enterprise audit stores — **product decisions:** [phase-9-product-decisions-request.md](../phase-9-product-decisions-request.md) (export **not approved**; deletion/consents partial).

## Account deletion flow

### Target behavior (soft delete — after implementation)

1. Signed-in user opens Account → Privacy & data → Delete account.
2. Better Auth enforces **session freshness** (`session.freshAge`, 24h) and typed **email confirmation** (`deleteUser` enabled in `@packages/better-auth`).
3. `buildSecurityDeleteUserCallbacks` (`@modules/security`):
   - **beforeDelete:** single transaction — revoke all `session` rows for the user, then set **`user.deletedAt`**; `beginActivity({ actionId: "security.account.delete", ... })` — logs `activity.started`; **does not** insert `activity_event`.
   - **afterDelete:** `logger.info("account.delete.completed", { actionId, activityId, outcome, app, module })` — diagnostic only.
4. Better Auth `deleteUser` adapter run still revokes sessions and attempts user/account deletes; **user** hard delete is blocked by plugin hook; **linked `account` rows** are retained (delete hook returns `false` except `/unlink-account`); **does not** remove other application rows by default.
5. **Sessions invalidated** (cookies cleared); user cannot authenticate; **same email cannot register again** — product copy: account unusable / data “erased” from user perspective; **email last copy** sent; **no restore**.

### Current runtime vs approved direction

**Target runtime (isolated DB):** User row **retained** with tombstone; sessions revoked; linked OAuth **`account` rows retained**; Better Auth user hard delete **blocked**.

**Evidence:** `tests/auth-security-isolated-db.test.tsx` (“soft-deletes a disposable account…”, “completes one delete-user under concurrent sessions…”, “blocks new sessions for a soft-deleted user”) · `tests/security-soft-delete-plugin.test.tsx` · `tests/security-account-deletion.test.tsx`.

Soft-delete implementation must replace step 4 without contradicting session-invalidation and diagnostic logging behavior unless explicitly approved.

## Application-owned Postgres data

### Policy: soft delete (user direction — 2026-11-14)

When a user completes account deletion:

| Concern                                                                                                     | Target policy                                                                                                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `user` row                                                                                                  | **Retained**; tombstone = **`deletedAt`** (non-null means deleted)                                                 |
| Retention window                                                                                            | **Indefinite** — no automatic hard purge job as product default                                                    |
| Reactivation / email reuse                                                                                  | **Block** — no account restore; same email cannot sign up; user sees deleted-account message                       |
| User-owned tables (`session`, preferences, `activity_event`, `activity_location`, OAuth/SSO bindings, etc.) | **Retained** by default — no automatic cascade wipe; sessions invalidated separately                               |
| User email after delete                                                                                     | **Last copy** emailed to user on successful delete (scope TBD)                                                     |
| User-visible narrative                                                                                      | Account **unusable**; “data erased” messaging; internal retention documented for ops                               |
| PII in retained rows                                                                                        | **Open** — redact, hide from APIs, or leave as-is ([gaps](#gaps--open-questions))                                  |
| Activity / location history                                                                                 | **Open** — retain as-is, anonymize, or align with separate clear-history semantics ([gaps](#gaps--open-questions)) |

### Reference inventory: cascade if `user` row were hard-deleted

_Use only for gap analysis — **not** the approved delete behavior._

| Area                     | Tables / data                                                          | If `user` row hard-deleted |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------- |
| Auth core                | `session`, `account` (OAuth links), `device_code` (when `user_id` set) | Removed                    |
| Profile identity         | `user` (`name`, `email`, `image` URL string, etc.)                     | Removed                    |
| Preferences              | `appearance_preferences`, `regional_preferences`                       | Removed                    |
| Privacy / location       | `user_permission`, `activity_location`                                 | Removed                    |
| Activity                 | `activity_event` (owner), `user_activity`, `security_activity`         | Removed                    |
| OAuth / MCP (user-bound) | OAuth consent/token rows referencing `user.id` in `oauth.schema`       | Removed                    |
| SSO (user-bound)         | Rows in `sso.schema` referencing `user.id`                             | Removed                    |

`activity_event.actor_user_id` uses `onDelete: "set null"` — events owned by **other** users are unaffected; rows owned by the deleted user are removed via `owner_user_id` cascade **only under hard delete**.

### Known remnants (unchanged assumptions for Blob / tokens)

| Artifact                   | Notes                                                  | v1 stance (retention doc)                                                |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `verification`             | Magic-link / identifier rows; no `user_id` FK          | **Accept** — short-lived tokens.                                         |
| `activity_event_tombstone` | Hash-only tombstones from user-initiated history clear | **Accept** — no PII; separate from account tombstone (`user.deletedAt`). |
| **Vercel Blob objects**    | Not in Postgres                                        | **Retain (Option A)**                                                    |

## Blob files (profile avatars)

### Policy: Option A — retain objects (approved)

This Phase 6 decision **does not override** [profile-avatar-blob.md](./profile-avatar-blob.md):

- **Approved:** no automatic blob deletion in application code.
- **Account deletion (soft or hard):** profile image URL may be cleared or hidden on the user record; **Blob storage objects are not deleted.**
- Applies equally to orphans from replace/clear, upload-without-persist, and post-delete.

**Manual cleanup:** Vercel Blob dashboard or approved future sweeper (Option D) / path tracking (Option C) — both require separate approval and likely migrations.

### User-visible copy gap (post-approval slice)

Auth i18n `deleteAccountConfirmDescription` (en-us / en-in / es-es across apps) **now states** internal retention, no re-registration, and **Blob Option A** avatar disclosure — aligned with soft delete + Option A (**2026-11-14**, verified in `tests/account-data-retention-policy.test.tsx`). Formal sign-off item **UI copy** remains open if product wants wording changes.

| Choice                                                   | Notes                                                                                                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **A — Clarify copy (recommended after policy approval)** | Align with soft-delete + Blob Option A. **No migrations.**                                                                        |
| **B — Leave copy as-is**                                 | Risk mismatch with soft-delete and Blob retention.                                                                                |
| **C — Revisit Blob policy**                              | Would require new approval of Option B/C/D — out of scope unless user reopens [profile-avatar-blob.md](./profile-avatar-blob.md). |

## Diagnostic logs

### Policy: Option A — defer retention to platform; no account-triggered erasure (unchanged)

Per [activity-and-logging.md](../../modules/activity-and-logging.md): activity history and diagnostic logs are **separate**. Account deletion today and under soft delete:

| Event                | Activity feed (`activity_event`)                                                              | Diagnostic log (`@packages/logger/server`)                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User deletes account | **No retained row** — `beginActivity` only; no `recordActivity` for `security.account.delete` | `activity.started` (attempt) + `account.delete.completed` (success) with `activityId`, `actionId`, `outcome` — **no email, name, or `ownerUserId` in completion log** |

Other procedures may log `ownerUserId` / resource IDs under normal operation; **this policy does not** require scanning or deleting historical log lines when an account is deleted.

**Production:** Do not document a specific retention period until the deployment log sink TTL is configured and verified (Phase 12).

### Diagnostic log options (for sign-off)

| Option                               | Description                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **A — Platform deferral (proposed)** | No app erasure on delete; configure retention at deploy; keep completion log minimal (current shape).                          |
| **B — Bounded security-log TTL**     | Ship an env-driven retention contract for auth/security log streams only — requires deploy + verification work after approval. |
| **C — Erasure on delete**            | Integrate with log vendor delete-by-query — out of scope without vendor choice and legal review.                               |

## Gaps / open questions

**Blocking full sign-off** (answer before **Approved by** and Phase 6 roadmap checkbox):

- [x] **Tombstone field name / shape:** **`deletedAt`** on the `user` row (partial preference, 2026-11-14).
- [x] **Retention window:** **Indefinite** soft retention — **no** automatic hard purge as product default (partial preference, 2026-11-14).
- [x] **Reactivation:** **Block** — no restore; same email cannot sign up; show message that account was deleted (partial preference, 2026-11-14).
- [ ] **PII visibility:** After soft delete, are `name` / `email` / `image` hidden from APIs and admin UI, masked, or unchanged while row is retained?
- [ ] **Activity and location rows:** Retain as-is, anonymize `owner_user_id`, or honor separate “clear history” semantics on account delete?
- [ ] **Sign-off bundle:** Confirm **soft delete (as refined above)**, **Blob Option A on delete**, and **diagnostic Option A** as the Phase 6 retention policy — pending user approval of this doc.
- [x] **UI copy:** Skipped (2026-11-14) — revisit after PII/retention answers (**A / B / C** table in Blob section).
- [ ] **verification / tombstone remnants:** Accept v1 stance table, or schedule later hygiene (no migrations in Phase 6 requirements pass)?
- [ ] **Mandatory audit retention:** Enterprise requirement to retain deletion evidence beyond diagnostic logs (e.g. dedicated audit row vs diagnostic-only)? — **Related direction:** [audit-data-versioning.md](./audit-data-versioning.md) (2026-11-14 batch).
- [ ] **Last-copy email:** Exact fields, attachment vs link, and timing relative to tombstone write.
- [ ] **better-auth.md** still lists “Define retention/deletion policy for application-owned records” — resolve via this doc approval and cross-link only.
- [x] **Typed email confirmation (delete flow):** **UI-only** — `SecurityAccountDeletionScreen` requires matching the account email before calling `deleteUser`; Better Auth `/delete-user` enforces **fresh session** (and optional password), not a server-side email field (2026-11-14 review batch).

## Implementation slices (after full sign-off + **go implement**)

1. Record approval in **Approved by** and check Phase 6 roadmap item **only** when user confirms full sign-off (remains **unchecked** until then).
2. Schema + auth hooks for soft delete (explicit **go implement** — not part of requirements-only updates).
3. ~~**UI copy A**~~ **Skipped** (2026-11-14) — update when copy choice reopened.
4. Phase 12: document verified log retention TTL in deploy checklist (no code unless Option B approved).

## Implementation compliance (2026-11-14 · verification batch)

Review of runtime vs **decided** policy only. **Undecided** items in [gaps](#gaps--open-questions) were **not** implemented.

| Policy area                                               | Status                      | Evidence / notes                                                                                                                                                                                                                                  |
| --------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Postgres soft delete (`user.deletedAt`)                   | **Compliant**               | `tombstoneUserForDeletion` revokes sessions then tombstones; user hard delete blocked (`buildSoftDeleteUserPlugin`). Isolated: `auth-security-isolated-db` soft-delete + concurrent delete. Unit: `tests/account-data-retention-policy.test.tsx`. |
| Related app rows retained (no cascade wipe)               | **Compliant**               | Isolated test keeps `appearance_preferences` + `account` after delete-user.                                                                                                                                                                       |
| Sessions invalidated on delete                            | **Compliant**               | Transaction deletes `session` rows; get-session null; repeat delete **401**.                                                                                                                                                                      |
| Same email blocked (no restore)                           | **Compliant**               | `/sign-up/email` tombstone guard; `createSession` guard; shared `DELETED_ACCOUNT_MESSAGE`.                                                                                                                                                        |
| OAuth `account` rows retained on delete                   | **Compliant**               | `account.delete` hook returns `false` except `/unlink-account`.                                                                                                                                                                                   |
| Blob Option A (no `del` on delete)                        | **Compliant**               | No profile delete hook; `tests/profile-avatar-blob-cleanup.test.tsx`.                                                                                                                                                                             |
| Diagnostic Option A (no feed row; minimal completion log) | **Compliant**               | `beginActivity` only; no `recordActivity` in delete callback; completion log excludes `ownerUserId` / email / name (`tests/security-account-deletion.test.tsx`, `activity-account-producers.test.tsx`).                                           |
| Delete UI retention copy                                  | **Compliant (implemented)** | i18n matches retention + Blob disclosure; not formally signed off in gaps table.                                                                                                                                                                  |
| Email last copy on delete                                 | **Gap (deferred policy)**   | Not implemented — doc direction only.                                                                                                                                                                                                             |
| PII visibility after tombstone                            | **Gap (open policy)**       | APIs/admin may still expose `name` / `email` / `image` on retained row — no redaction shipped.                                                                                                                                                    |
| Activity / location on account delete                     | **Gap (open policy)**       | Rows retained; no anonymize-on-delete behavior.                                                                                                                                                                                                   |
| Dedicated “retained data” / export UX                     | **Gap**                     | AUTH-DELETE-02; data-export page unavailable.                                                                                                                                                                                                     |
| Formal policy sign-off + Phase 6 roadmap checkbox         | **Gap**                     | **Approved by** still pending; [auth-account-roadmap.md](../auth-account-roadmap.md) item stays unchecked.                                                                                                                                        |
| Isolated DB suite in CI                                   | **Gap (env)**               | Soft-delete E2E requires `AUTH_SECURITY_TEST_DATABASE_URL` === `DATABASE_URL`; skipped in default vitest runs.                                                                                                                                    |

## Validation checklist (before sign-off)

- [x] Hard-delete cascade inventory matches `packages/drizzle/src/schema/*` (reference only)
- [x] Soft-delete direction recorded (2026-11-14)
- [x] Blob policy aligned with [profile-avatar-blob.md](./profile-avatar-blob.md) Option A (no contradiction)
- [x] Account deletion logging behavior matches `security.delete-user.ts` and tests (current runtime)
- [x] No migrations or Blob `del` implementation in this initiative
- [ ] User confirmed sign-off on **refined** soft-delete policies + Blob + diagnostic options (partial tombstone/retention/reactivation only — not full approval)
- [x] UI copy decision: **skipped** (2026-11-14)
