# Requirements: Account privacy consents (beyond location)

**Status:** Approved — Phase 9 batch D1 (consents) + D4 (deletion shortcut unchanged)  
**Approved by:** Product owner — **2026-11-15**  
**Layers:** packages / modules / apps  
**Roadmap:** Phase 9 — [auth-account-roadmap.md](../auth-account-roadmap.md)  
**Decisions queue:** [phase-9-product-decisions-request.md](../phase-9-product-decisions-request.md) (**batch D**, especially **D1**; **A3** hub split)

## Goal

Let signed-in users **view and change** approved privacy-related preferences in one Privacy & data place, without duplicating location controls that already live under Security — and without implying consents exist when product has not defined them.

## Approved today (do not re-implement without doc change)

| Consent / control                 | Spec                                                                                 | UI / API                                                                                                                                      | Notes                                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Location collection (account)** | [session-geolocation.md](./session-geolocation.md) (**Approved** 2026-11-07)         | `SecurityPermissionsScreen` on `/account/permissions`, `/account/security/permissions`, **`/account/privacy-data/consents`** (thin re-export) | Server: `user_permissions` + oRPC `location.preference`; activity `privacy.location_preference.update`, `privacy.location_history.delete` |
| **OAuth / MCP scope consent**     | Phase 11 (not Phase 9)                                                               | `/auth/.../consent`, `oauth_consent`                                                                                                          | **Out of scope** for this doc — separate authorization flow                                                                               |
| **Account deletion confirmation** | [account-data-retention-deletion.md](./account-data-retention-deletion.md) (partial) | `/account/privacy-data/account-deletion` → `@modules/security`                                                                                | Typed confirm; not a “marketing/analytics” consent matrix                                                                                 |

**Worker rule:** Keep shipping location via `@modules/location` only. Do **not** add marketing/analytics toggles, new tables, or consent enforcement until **Approved by** is set and **D1–D4** appear in the Phase 9 sign-off log.

## In scope (proposed — not approved)

Align with **D1** default in [phase-9-product-decisions-request.md](../phase-9-product-decisions-request.md):

- [ ] **Privacy consents** tab content at `/account/privacy-data/consents` that includes:
  - Marketing email opt-in/out (**off by default**).
  - Optional analytics / telemetry (**off by default**).
  - **Link** (not duplicate full UI) to **Security → Location** for session/sign-in geolocation (location stays canonical under Security per **A3**).
- [ ] Persisted per-user preference store (e.g. Drizzle table or JSON column — **new migration after approval**).
- [ ] oRPC list/patch for consents; owner-scoped session only.
- [ ] Activity producers for consent changes (registry pattern in `activity.actions.ts`).
- [ ] i18n (`en-us`, `en-in`, `es-es`) for labels, descriptions, and empty/error states.
- [ ] Hub copy on `/account/privacy-data` that matches **implemented** consent types (no “full GDPR matrix” until defined).

## Out of scope (v1 proposal)

- Automated **data export** (see **D2** — separate placeholder route; no requirements doc yet).
- **Org-scoped** privacy consents or org data export ([storage-system.md](./storage-system.md) R8 deferred).
- Cookie banner / anonymous visitor consent (pre-auth marketing site).
- Third-party CMP integrations.
- Changing location capture semantics (already normative in session-geolocation).
- Registering OAuth allow/deny in the unified activity feed (known gap: AUTH-ACT-01).

## Architecture (proposed)

| Layer                                                              | Responsibility                                                                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/drizzle`                                                 | `user_privacy_consent` or `user_preferences.privacy` JSON — **after approval**                                                                         |
| `modules/privacy` or extend `@modules/shell` + small domain module | Consent matrix UI, oRPC, validation                                                                                                                    |
| `apps/auth`                                                        | Thin `privacy-data/consents/page.tsx` — swap re-export when approved                                                                                   |
| `@modules/location`                                                | **Unchanged** — remain source of truth for location                                                                                                    |
| Delivery / email                                                   | If marketing opt-in changes, coordinate with [account-notifications.md](./account-notifications.md) **C3** (avoid two conflicting “marketing” toggles) |

## End-to-end flow (proposed)

1. User opens **Privacy & data → Consents**.
2. Screen shows marketing + analytics toggles (if approved) and a link to **Security → Location**.
3. Toggle change → confirm if product requires → oRPC patch → activity row + optional notification hook.
4. Downstream jobs (email, analytics SDK) read server-side flags only; **no** client-only consent.

## Authorization

- Session required; **owner user id** from server session only.
- No org-admin visibility into member marketing prefs in v1.

## Gaps / open questions

| ID  | Question                                                                    | Where decided                    | Default (not approved)                                            |
| --- | --------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| G1  | Exact consent categories beyond location?                                   | **D1**                           | Marketing email + optional analytics                              |
| G2  | Single table vs JSON blob on existing prefs?                                | This doc + user                  | TBD at approval                                                   |
| G3  | Is analytics “product telemetry” or includes map tile (CARTO) choice?       | session-geolocation vs this doc  | Map disclosure stays in location flow unless merged               |
| G4  | Relationship to **notifications** “Product” category (**C3**)               | notifications + privacy docs     | One marketing truth — avoid duplicate toggles                     |
| G5  | Consent version / audit (“consent v2”) for legal replay?                    | User / legal                     | Not in v1 unless requested                                        |
| G6  | Enforcement points (block emails, skip analytics beacons)                   | Engineering after catalog locked | No enforcement code until flags exist                             |
| G7  | Should `/account/privacy-data/consents` stop re-exporting full location UI? | **A3** + **D1**                  | Composite screen + link vs today’s full `SecurityPermissionsView` |

### Requirements review (item **112** — 2026-11-14)

**Repo state**

- `apps/auth/.../privacy-data/consents/page.tsx` → `SecurityPermissionsView` (`@modules/location`) only.
- Hub + destination copy: `managePrivacyConsentsExportAndAccountDeletion` / `controlLocationCollectionForSignInAndSecurityActivity` (`shell.privacy-data.tsx`, `shell.account-hub.config.ts`).
- Tests: `tests/phase9-account-sections.test.tsx`, `tests/location-permissions-states.test.tsx` (three-route parity).
- **No** `account-privacy-consents` migration; **no** marketing/analytics fields in Drizzle user prefs.
- Phase 9 sign-off log **empty** — **D1–D4** not approved ([phase-9-product-decisions-request.md](../phase-9-product-decisions-request.md)).

**Report rows:** AUTH-PERM-04 (0/100 Proposed), AUTH-PRIVACY-01 (broader consent undefined).

## Implementation slices (after approval)

1. Schema + oRPC read/patch + activity ids.
2. Replace or wrap consents page UI (matrix + location link); keep Security routes unchanged.
3. Wire enforcement for approved channels only (email/analytics).
4. i18n parity + `phase9-account-sections` / consents-specific tests.
5. Update [auth-page-action-report.md](../auth-page-action-report.md) AUTH-PERM-04 when slice ships.

## Validation before approval

- [ ] User approves **D1** (and **A3** if consents layout changes).
- [ ] Marketing vs notifications **C3** ownership agreed.
- [ ] Consent catalog and defaults documented.
- [ ] **Approved by** filled — no implementation before sign-off.
