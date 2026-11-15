# Requirements: Profile optional fields (phone, biography, location, website)

**Status:** Draft — partial preferences recorded; awaiting sign-off on remaining questions  
**Approved by:** _(name/date — fill on sign-off)_  
**Layers:** packages / modules / apps  
**Roadmap:** Phase 4 — [auth-account-roadmap.md](../auth-account-roadmap.md) (“Decide phone, biography, location, and website fields and migrations”)  
**Related:** [profile-completion.md](./profile-completion.md) · [session-activity-location.md](./session-activity-location.md) · [application-activity.md](./application-activity.md) · [form-input-fields.md](./form-input-fields.md)

## Goal

Decide whether and how the account profile persists **optional** phone, biography, **profile location**, and website values. Agree storage, validation, activity recording, and migration approach **before** schema changes, oRPC procedures, or profile UI. No implementation in this doc.

## Current state (evidence)

| Area                     | Today                                                                                                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user` table             | `id`, `name`, `email`, `email_verified`, `image`, role/ban fields, timestamps — **no** phone, biography, website, or profile-location columns ([`packages/drizzle/src/schema/auth.schema.ts`](../../../packages/drizzle/src/schema/auth.schema.ts)). |
| Profile update API       | Better Auth `updateUser` with `name` and `image` only ([`profile.validation.update.ts`](../../../modules/profile/src/utils/validation/profile.validation.update.ts)).                                                                                |
| Profile UI               | Personal section: editable display name; read-only email + verification badge; member-since note ([`profile.account-personal.client.tsx`](../../../modules/profile/src/client/components/personal/profile.account-personal.client.tsx)).             |
| Activity                 | `account.profile.update` fires on Better Auth `/update-user` ([`security.auth-database-hooks.ts`](../../../modules/security/src/server/shared/security.auth-database-hooks.ts)); metadata schema is empty today.                                     |
| Form kit                 | `tel`, `url`, and `textarea` field types exist and are documented ([`form-input-fields.md`](./form-input-fields.md)); tel uses calling-code select + national number input.                                                                          |
| Similar pattern          | `regional_preferences` — 1:1 `user_id` PK, nullable columns, app-owned oRPC ([`regional-preferences.schema.ts`](../../../packages/drizzle/src/schema/regional-preferences.schema.ts)).                                                               |
| **Not** profile location | Session/device **geolocation** (coordinates, consent, history) is specified in [session-activity-location.md](./session-activity-location.md) and lives in activity/location tables — separate product surface (Phase 6 roadmap).                    |

[profile-completion.md](./profile-completion.md) lists these four fields as in-scope for a complete profile; this document resolves **how** (or **if**) they ship.

## In scope for this decision

- Field inclusion: which of the four (if any) are in the first implementation slice.
- Persistence model and migration shape (nullable defaults, `ON DELETE CASCADE`, backfill).
- Validation and normalization rules per field.
- Read/write path: Better Auth session vs module oRPC vs both.
- Activity/audit: reuse `account.profile.update` vs dedicated action IDs; whether to record field-level critical changes.
- UX placement: same profile accordion as name/email; optional vs required; empty vs “not set”.
- Cross-user isolation and concurrent partial updates (same bar as regional preferences).

## Out of scope (unless explicitly pulled in)

- Phone **verification** (SMS/OTP), two-factor use of phone, or marketing SMS.
- Public profile pages, org directory, or exposing these fields to other users.
- Reverse geocoding, map pickers, or reusing session `activity_location` as the profile location editor.
- Email change, social links beyond a single website URL, custom arbitrary JSON profile blobs.
- Automated test files (project preference: browser + targeted checks after implementation).

---

## Distinction: profile location vs session geolocation

| Concept                 | User intent                                     | Typical storage                                    | Roadmap            |
| ----------------------- | ----------------------------------------------- | -------------------------------------------------- | ------------------ |
| **Profile location**    | “Where I say I am” (contact/public card style)  | Text and/or structured place fields on profile     | Phase 4 (this doc) |
| **Session geolocation** | Security / activity map with browser permission | `activity_location`, consent in `user_permissions` | Phase 6            |

**Default recommendation unless product says otherwise:** do **not** sync or copy session coordinates into profile location; keep systems separate and label UI copy accordingly.

---

## Storage and API — decision options

Choose **one** primary model (hybrid only if justified in sign-off).

### Option S1 — Columns on `user` + Better Auth `additionalFields`

Add nullable columns on `user`. Register matching Better Auth additional fields so `updateUser` and session payloads can carry them.

| Pros                                                    | Cons                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| Single read on profile load via existing session        | Must keep Drizzle schema, Better Auth config, and generated types in sync |
| Reuses existing profile name/image update path and hook | Extends vendor user table; harder to revoke fields without migration      |
|                                                         | Unclear whether all four belong in session cookie payload (size, PII)     |

### Option S2 — `profile_details` 1:1 table (app-owned), oRPC in `modules/profile`

New table `profile_details` (`user_id` PK → `user.id` ON DELETE CASCADE), nullable columns. Authenticated oRPC read + partial patch; **do not** add to Better Auth session by default.

| Pros                                                                           | Cons                                                            |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Matches `regional_preferences` ownership and isolation patterns                | Extra query when opening profile (can cache via TanStack Query) |
| Profile module owns validation and activity without coupling to `/update-user` | Name/image stay on Better Auth; two write paths on one screen   |
| Easier to omit sensitive fields from session/JWT                               | Requires new procedures, OpenAPI routes, and migration          |

### Option S3 — Hybrid

Example: `phone` on `user` (if Better Auth documents phone as additional field) and biography/location/website on `profile_details`.

| Pros                                     | Cons                                       |
| ---------------------------------------- | ------------------------------------------ |
| Phone available to future auth features  | Two persistence models; highest complexity |
| Keeps large text off session user object | Needs explicit sign-off on split           |

### Option S4 — Defer all four fields

Record as **out of scope** for current profile milestone; leave schema unchanged; close roadmap item with evidence in this doc.

| Pros                                    | Cons                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| No migration risk now                   | [profile-completion.md](./profile-completion.md) goal remains partially unmet |
| Phase 4 UI stays name/email/avatar only | Product may still expect contact fields later                                 |

**Open — pick S1, S2, S3, or S4:** _[x] **S2** — user preference **2026-11-14 batch** (supersedes prior S1 preference; not final sign-off; questions 2–10 open)._

### S2 — implementation touchpoints and migration intent (after full approval only)

No migrations or UI in this initiative until sign-off below. If **S2** is approved, expect coordinated changes across:

| Layer       | Touchpoint                                                                                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema      | New `profile_details` table (`user_id` PK → `user.id` ON DELETE CASCADE), nullable phone/biography/location/website columns; **keep** Better Auth `user` limited to auth identity fields (`name`, `email`, `image`, etc.). `pnpm --filter @packages/drizzle db:generate` + `db:migrate` on isolated DB first. |
| Better Auth | **Do not** add optional business-profile fields to `user.additionalFields` or session payload by default.                                                                                                                                                                                                     |
| API         | App-owned oRPC in `@modules/profile` — authenticated read + partial patch (mirrors `regional_preferences` pattern).                                                                                                                                                                                           |
| Validation  | Profile module validation for optional fields; `updateUser` remains `name` / `image` only unless product later moves name.                                                                                                                                                                                    |
| UI          | `ProfileAccountPersonal` and related FormKit fields (`tel`, `textarea`, `text`, `url` per [form-input-fields.md](./form-input-fields.md)).                                                                                                                                                                    |
| Activity    | Record changes in profile service — `/update-user` may **not** fire for `profile_details` patches (see Activity section).                                                                                                                                                                                     |
| i18n        | Auth message bundles for labels, validation, and empty states.                                                                                                                                                                                                                                                |

**Migration intent (2026-11-14 batch):** Split **Better Auth user needs** from **business profile** into **`profile_details`**; no fabricated backfill required for v1 (nullable rows). Prior **S1** preference is withdrawn.

**S2 does not decide v1 field set** — questions 2–6 and 8–10 remain blockers even with storage model preference recorded.

---

## Per-field decision options

For each field: **Include** (yes/no/defer), **storage column(s)**, **validation**, **UI control** (FormKit type), **empty behavior**.

### Phone

| Topic        | Options                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Include?     | **A)** Yes, optional · **B)** Defer · **C)** Out of scope                                                                                 |
| Stored form  | **A)** Single `text` E.164 (e.g. `+14155552671`) · **B)** `country_calling_code` + `national_number` · **C)** Free-form string as entered |
| UI           | Existing `tel` field (calling-code select + input) per form kit                                                                           |
| Validation   | **A)** libphonenumber-style strict E.164 · **B)** Length/pattern only · **C)** Optional empty; validate only when non-empty               |
| Verification | **Default defer** — storage only; no “verified phone” badge in v1                                                                         |
| Privacy      | Account-only; never show on session list or activity rows without redaction policy                                                        |

**Open — phone:** Include? _[]_ · Storage _[]_ · Validation _[]_

### Biography

| Topic       | Options                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------- |
| Include?    | **A)** Yes, optional · **B)** Defer · **C)** Out of scope                                    |
| Stored form | `text` column (Postgres `text`)                                                              |
| UI          | `textarea` with character counter (`maxLength` TBD)                                          |
| Content     | **A)** Plain text only · **B)** Limited markdown subset · **C)** Plain + strip control chars |
| Limits      | **Proposed:** max 500–2000 chars — confirm                                                   |
| Abuse       | No HTML rendering in v1; optional server-side trim/normalize newlines                        |

**Open — biography:** Include? _[]_ · Max length _[]_ · Markdown? _[]_

### Profile location

| Topic             | Options                                                                                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Include?          | **A)** Yes, optional · **B)** Defer · **C)** Out of scope                                                                                                                                            |
| Semantics         | **A)** Single free-text line (“City, Country”) · **B)** Structured `locality` + `country_code` (ISO 3166-1 alpha-2) · **C)** “Use regional preference region only” (read-only hint; no extra column) |
| UI                | **A)** `text` · **B)** Two fields · **C)** Combobox for country + text city                                                                                                                          |
| vs regional prefs | Regional **region** is formatting preference, not necessarily residence — do not auto-copy without user action                                                                                       |

**Open — profile location:** Include? _[]_ · Semantics _[]_

### Website

| Topic            | Options                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| Include?         | **A)** Yes, optional · **B)** Defer · **C)** Out of scope                                                          |
| Stored form      | `text` absolute URL                                                                                                |
| UI               | Existing `url` field (https prefix UX)                                                                             |
| Validation       | **A)** Must be `https://` only when set · **B)** Allow `http://` · **C)** URL + blocklist internal hosts           |
| Save-time checks | **No server-side fetch** of URL (align with avatar URL policy in [profile-completion.md](./profile-completion.md)) |
| Display          | Optional link opens in new tab with `rel="noopener noreferrer"` when rendered                                      |

**Open — website:** Include? _[]_ · HTTPS-only? _[]_

---

## Migration (after approval only)

Proposed conventions (adjust to chosen storage model):

1. **New migration** via existing Drizzle `db:generate`; apply with `db:migrate` in isolated DB first.
2. **Nullable columns**, no default fabricated values — existing users remain “unset”.
3. **`ON DELETE CASCADE`** from `user` for any 1:1 child table.
4. **No backfill** from OAuth provider metadata unless explicitly approved (provider profiles may lack these fields).
5. **Rollback plan:** forward-only migration; reversing requires a new migration (document if production has data).

If **S4 Defer** is chosen: **no migration** in this initiative.

---

## Activity and logging (after approval)

| Topic            | Options                                                                                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Action ID        | **A)** Keep single `account.profile.update` for any profile field change · **B)** Add granular IDs (e.g. `account.profile.contact.update`) · **C)** Profile details only on new ID; name/image stay on existing hook |
| Metadata         | Extend activity metadata schema with **non-sensitive** field names changed (not full biography text in activity rows)                                                                                                |
| Critical change  | Follow [application-activity.md](./application-activity.md) — register before/after only if classified critical                                                                                                      |
| Better Auth hook | If using **S2**, updates may **not** hit `/update-user`; must record activity in profile service explicitly                                                                                                          |

**Open — activity:** _[]_

---

## UX and form layout (after approval)

- Place optional fields in the **Profile → Personal** accordion (or new accordion section if biography is long) using `FormKit` / existing field types only.
- Treat all four as **optional**; distinguish **unset** (null) vs **cleared** (empty string policy — prefer storing `null` when user clears).
- Edit mode: align with current name pattern (read-only view + Edit) or single save for whole personal block — **confirm preference**.
- i18n: all labels/descriptions in Auth (and shared message copies if profile is reused elsewhere).
- Loading/error/persistence: same toast + retry patterns as display name update.

---

## End-to-end flow (target, post-approval)

1. Signed-in user opens account profile personal section.
2. Client loads name/email from session; loads optional fields from session and/or profile oRPC per storage decision.
3. User edits optional fields and saves; server validates, persists only for session user, records activity.
4. Reload and second device show persisted values; another user cannot read or write them.

---

## Environment

No new environment variables proposed. Uses existing `DATABASE_URL` and Better Auth session.

---

## User preferences (partial)

| Date             | Decision                                                        | Notes                                                                                                                                         |
| ---------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-14       | **S1** — columns on `user` + Better Auth `additionalFields`     | Superseded by **S2** (same batch follow-up).                                                                                                  |
| 2026-11-14 batch | **S2** — `profile_details` 1:1 table, oRPC in `modules/profile` | Preference only; reversible until full doc approval. Roadmap Phase 4 item stays **unchecked** until all sign-off blockers below are resolved. |

---

## Gaps / questions for user (sign-off blockers)

Answer in replies or by editing checkboxes in this doc.

1. **Storage model:** S1, S2, S3, or S4? — **Preference: S2 (2026-11-14 batch)** — `profile_details` separate from Better Auth `user`; confirm at final sign-off.
2. **Field set:** Which of phone, biography, profile location, website are **in v1** vs **defer**?
3. **Profile location:** Free text, structured, or tied to regional region display only?
4. **Phone:** E.164 in one column vs split columns; strict validation vs light validation?
5. **Biography:** Max length; plain text only?
6. **Website:** HTTPS-only when non-empty?
7. **Session payload:** Should optional fields appear on Better Auth session user object, or only on profile fetch? — **Default under S2:** profile fetch / oRPC only (not session); confirm at sign-off.
8. **Edit UX:** One combined “Edit personal info” save vs separate sections?
9. **Activity:** Single `account.profile.update` vs split action IDs?
10. **Priority:** If scope must shrink, which field(s) to drop first?

---

## Implementation slices (only after “Approved”)

1. Apply agreed migration(s) to isolated database; verify cascade and nullability.
2. Server: validation, user-scoped repository/service, oRPC (+ compatibility if needed) per storage model; wire activity recording.
3. Client: extend profile form schema, personal section UI, hooks, and messages.
4. Browser verification with disposable accounts: empty, invalid, max length, clear-field, persistence, cross-user denial.
5. Update [profile-completion.md](./profile-completion.md) status; check roadmap Phase 4 item when decisions are **implemented**, not when this doc is draft.

---

## Validation checklist (before approval)

- [x] Current schema and profile code paths identified.
- [x] Profile location distinguished from session geolocation.
- [x] Storage options and per-field choices documented.
- [x] Migration and activity tradeoffs listed.
- [x] User selected storage model (S1–S4). **S2** — preference **2026-11-14 batch** (final sign-off still required).
- [ ] User selected per-field include/validation rules.
- [ ] User recorded sign-off (“approved” / “go implement”) below.

**Sign-off:** _[] Approved — proceed to implementation_  
**Roadmap:** [auth-account-roadmap.md](../auth-account-roadmap.md) Phase 4 migration decision remains unchecked until this doc is fully approved (9 questions remaining after storage model).
