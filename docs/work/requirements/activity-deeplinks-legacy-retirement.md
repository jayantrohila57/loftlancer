# Requirements: Activity resource deep links and legacy retirement

**Status:** **Partial approval** (2026-11-14) — core product choices + **P7 Q9/Q10 clarifications** recorded below; **full doc not approved** until user says **“approved”** (no implementation until full sign-off + “go implement”)  
**Approved by:** _(full sign-off pending)_ — partial choices recorded 2026-11-14 (chat); deep-link target + legacy retirement intent clarified same day (second batch)  
**Layers:** packages / modules / apps  
**Roadmap:** Phase 7 — [auth-account-roadmap.md](../auth-account-roadmap.md) (“Decide resource deep links and retirement of legacy APIs/triggers”) — **checkbox stays unchecked** until sign-off here  
**Related:** [application-activity.md](./application-activity.md) (unified activity — implemented) · [auth-api-migration.md](./auth-api-migration.md) (compatibility HTTP policy) · Phase 8 (“Verify migration, legacy-trigger, rollback”)

## Goal

Record **approved product and technical decisions** for:

1. **Where activity timeline clicks may navigate** for `resource.*` (and related cross-app) targets—without inventing URLs from untrusted metadata.
2. **When and how to retire** the transitional `user_activity` / `security_activity` stores, SQL compatibility triggers, and legacy list/delete APIs—after unified `activity_event` is the sole source of truth.

**Product target (P7 Q9 — 2026-11-14):** Deep links **throughout the application**—**Auth**, **Studio**, and **Console** wherever the server target resolver + permissions allow a safe `href`. Auth-only resource feed is **acceptable interim** until Studio (and other apps) produce events and authorization rules exist; it is **not** the long-term end state. When no safe target exists, **hide** nav and row navigation affordances (prior batch).

**Data path target (P7 Q10 — 2026-11-14):** **Latest stack only**—unified `activity_event`, server `recordActivity` (and `beginActivity` where reserved IDs apply). **Complete L1 retirement**; **drop** legacy tables, APIs, and SQL triggers. **No long-term dual-write** (`recordUserActivity` / `recordSecurityActivity` and trigger mirroring are transitional, not indefinite).

This pass is **requirements only**. No migrations, route changes, producer rewrites, or API removals until explicit approval.

## Current state (inventory — 2026-11-14)

### Unified activity (keep)

| Surface         | Contract                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| oRPC            | `security.activity.feed`, `.detail`, `.clear` (`/auth/api/openapi/security/activity/…`)                                                                 |
| UI              | `UnifiedActivityFeed` on overview, account, login/security, and resource scope; data management uses **unified clear only** (`useActivityApi.useClear`) |
| Highlight       | `?activityId=` on allowlisted Auth account routes via `ActivityDestinationHighlight`                                                                    |
| Target resolver | `modules/activity/src/server/services/activity.target-resolver.ts`                                                                                      |

**Account targets:** Fixed map `activityTargetPaths` (profile, sessions, providers, permissions, regional, appearance, deletion, device authorization).

**Console / administration targets:** `console.users`, `console.sso` → cross-app URL under `CONSOLE_APP_URL` (default dev `http://localhost:3004`) **only** when the viewer passes the same checks as today: verified email, `CONSOLE_ADMIN_EMAILS`, and `admin` role.

**Resource targets (interim code, not yet signed off as policy):** Any `routeKey` starting with `resource.` with `category === "resource"`, matching action definition, and **no** `target.params` / `target.anchor` → links to **`/account/activity/resource`** (read-only feed). Per-resource Studio URLs are **not** resolved. Events with `target.params` / `target.anchor` get **`canViewTarget: false`** (tests in `tests/activity-target-resolver.test.tsx`).

**Resource UI today:** `/account/activity/resource` shows `UnifiedActivityFeed scope="resource"` with copy implying limited availability (`resourceActivityUnavailable`); there are **no** registered `resource.*` action IDs in `activity.actions.ts` yet—only admin/console actions and account/security/privacy/preferences.

### Legacy compatibility (retire after approval)

| Artifact                                                  | Role                                                                                               | Callers today                                                                                                              |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Tables `user_activity`, `security_activity`               | Pre-unified history + dual-write sink                                                              | Triggers + `recordUserActivity` / `recordSecurityActivity`                                                                 |
| SQL functions / triggers (`0004`–`0006`)                  | `activity_import_legacy`, `activity_sync_legacy`, `activity_delete_legacy`, provider-unlink dedupe | Mirror legacy ↔ `activity_event`; clear/delete keeps both stores aligned                                                   |
| oRPC `security.activity.list`, `security.activity.delete` | Paginated legacy feed and per-kind delete                                                          | `useActivityApi.useList` / `useDelete` — used by **`SecurityActivityScreen`** only                                         |
| HTTP `GET`/`DELETE` `/auth/api/account/activity`          | Pre-oRPC compatibility                                                                             | No in-repo app callers located; covered by `tests/activity-compatibility-errors.test.tsx`                                  |
| Legacy IDs                                                | `legacy:user:{id}`, `legacy:security:{id}`                                                         | Backfill + hooks; location rows linked via `legacy:security:` migration                                                    |
| Producers still dual-writing                              | Profile update, provider unlink, session/security hooks                                            | `security.auth-database-hooks.ts` → `recordUserActivity` / `recordSecurityActivity` (updates canonical row where possible) |

**Not legacy:** `activity_event`, `activity_event_tombstone` (clear guard), unified feed/detail/clear, `beginActivity` / `recordActivity` for preferences, location, admin list, SSO list, provider link, account delete logging.

## In scope (this requirements pass)

- [x] Inventory current resolver behavior and legacy surfaces.
- [x] Define **resource deep-link options** and a recommended default for sign-off.
- [x] Define **legacy retirement phases**, prerequisites, and rollback constraints.
- [x] List **open questions** blocking approval.
- [x] User sign-off on **core** options (R1, C1, L1, table drop) — **2026-11-14** (partial; see Approval).
- [ ] Full doc sign-off (**“approved”**) + remaining open questions resolved.
- [ ] Record full approval date / approver in this doc.

## Out of scope

- Implementing resolvers, Studio routes, or new `resource.*` action registrations.
- Dropping triggers/tables or removing HTTP/oRPC procedures.
- Failed sign-in attribution, page-visit collection ([application-activity.md](./application-activity.md) — separate decisions).
- Soft-delete account retention ([account-data-retention-deletion.md](./account-data-retention-deletion.md)) — legacy table drop timing may **depend** on that policy but is not decided here.

## Resource deep links — decision options

All options assume: server-only resolution; **no** client-supplied URLs; tampered `activityId` cannot expose another user’s resource; opening a target **does not repeat** the original mutation.

| ID                                                                             | Policy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | User experience                                                                                                                                                       | Engineering                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1 — Auth interim (v1)** — **refined 2026-11-14 batch**                      | When the target resolver returns a **safe** `targetUrl` / `canViewTarget: true`, **redirect** the user there (same as account targets — in-app navigation with `?activityId=` highlight where supported). When there is **no** safe target, **do not** show a misleading nav affordance — **hide** resource (or row) navigation that would dead-end. Copy remains honest that Studio object links are not available yet. **Not forever:** stepping stone toward cross-app deep links (P7 Q9). | `resource.*` rows with resolver link → `/account/activity/resource?activityId=…` (or other allowlisted in-app URL). Rows without safe target → details-only / no hop. | No Studio URL builder in v1 slice. Shell/nav may **omit** resource scope entry until safe targets exist (see open questions).                                                                                                                       |
| **R2 — Cross-app deep links (product target)** — **direction confirmed P7 Q9** | **Target end state:** activity clicks may navigate to **Auth**, **Studio**, or **Console** per resolver + permission checks—same pattern as today’s account and `console.*` hops. For resources: when `resourceType`, `resourceId`, and a registered `routeKey` (e.g. `resource.project`) are present **and** the viewer still has access in the target app, resolve allowlisted URL (`STUDIO_APP_URL` / in-app path) + locale rules.                                                         | Click opens the permitted destination (new tab vs same tab per UX rule). Denied/deleted → unavailable state; **hide** affordance when no safe href.                   | Requires per-type path templates, authorization checks in each app (or shared module), env URLs, and tests. Ship in **follow-up slices** after at least one real producer writes consistent `target` + resource fields—not “optional nice-to-have.” |
| **R3 — Auth-only detail, no cross-app**                                        | Resource rows never leave Auth; detail popover only (no `targetUrl`).                                                                                                                                                                                                                                                                                                                                                                                                                         | Timeline rows show Details; no navigation affordance for resource category.                                                                                           | Simplest; may regress current interim link to resource feed.                                                                                                                                                                                        |
| **R4 — Defer resource category in UI**                                         | Hide or grey out resource scope in nav until R1 or R2 is ready.                                                                                                                                                                                                                                                                                                                                                                                                                               | Users do not see an empty/partial resource feed.                                                                                                                      | Shell/nav change; feed API may still accept `scope=resource` for admins.                                                                                                                                                                            |

### Console / administration (confirm alongside resource choice)

| ID                                  | Policy                                                                                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C1 — Keep current (recommended)** | Continue **C1**: Console deep links only for verified platform administrators; locale fixed to `en-us` segment today; expand segments only via new entries in `activityConsoleTargetSegments` + action definitions. |
| **C2 — Auth-only admin audit**      | Future: all administration events link to an Auth read-only page (no Console hop)—**not** recommended until Console admin UX is duplicated on Auth.                                                                 |

### Recommendation (for sign-off — change if product prefers otherwise)

- **Deep links (P7 Q9):** **Product target = R2** (Auth + Studio + Console where resolver + permissions allow). **Ship v1 as R1** (Auth interim + hide when no safe href) until producers and per-app authorization exist; **do not** treat Auth-only resource feed as permanent policy.
- **Console:** **C1** (codify current behavior; part of cross-app target).

## Legacy APIs and triggers — retirement options

| ID                                                           | Policy                                                                                                                                                                           | Notes                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **L1 — Phased removal (recommended)** — **confirmed P7 Q10** | Retire in ordered slices with tests after each slice; keep rollback migration plan until Phase 8 sign-off. **End state:** only `activity_event` + `recordActivity`; legacy gone. | See phases below.                                                                 |
| **L2 — Indefinite compatibility**                            | Keep dual-write, triggers, and list/delete APIs forever.                                                                                                                         | **Rejected** (P7 Q10 — need latest stuff only; no long-term dual-write).          |
| **L3 — Stop dual-write, retain tables read-only**            | Producers write only `activity_event`; triggers dropped; legacy tables kept for historical queries only.                                                                         | Middle ground if external tools still read `user_activity` / `security_activity`. |
| **L4 — Hard drop**                                           | After L1 phases, migration drops tables + functions + triggers.                                                                                                                  | Requires backup/export decision for any compliance need.                          |

### Recommended phased plan (**L1** — implement only after approval)

| Phase                        | Prerequisite            | Work (summary)                                                                                                                                                                                                                                                                                                                      | Verification                                                                                                                              |
| ---------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **L1a — Caller audit**       | Sign-off                | Confirm no external consumers of `/api/account/activity` or legacy oRPC; document in [auth-api-migration.md](./auth-api-migration.md).                                                                                                                                                                                              | **In-repo complete** — [orpc-openapi-caller-audit.md](../orpc-openapi-caller-audit.md); optional deploy access logs for external callers. |
| **L1b — Producer migration** | L1a                     | Replace `recordUserActivity` / `recordSecurityActivity` with `recordActivity` for profile, provider unlink, session/security hooks; stop inserting into legacy tables **without** relying on triggers for new rows. **No long-term dual-write** (P7 Q10).                                                                           | DB tests: new events only in `activity_event`; actors/targets populated.                                                                  |
| **L1c — Client cleanup**     | L1b                     | Remove or repurpose `SecurityActivityScreen`, `useList` / `useDelete` legacy hooks if no route uses them; ensure all clear paths use unified `activity.clear`.                                                                                                                                                                      | Grep + component tests; no UI calls `security.activity.list`.                                                                             |
| **L1d — API deprecation**    | L1c                     | Mark legacy oRPC + HTTP as deprecated in OpenAPI/docs; optional sunset period; return structured deprecation header if needed.                                                                                                                                                                                                      | OpenAPI + compatibility tests updated.                                                                                                    |
| **L1e — Trigger removal**    | L1d + Phase 8 checklist | New migration: drop `activity_*_legacy_sync`, `activity_delete_legacy` (and provider-specific compat from `0006` if superseded); retain `activity_event` tombstone guards unless policy changes.                                                                                                                                    | Migration tests on disposable DB; `db:migrate` only.                                                                                      |
| **L1f — Table retirement**   | L1e + retention policy  | **Chosen (2026-11-14 batch): Option A** — **drop** legacy tables and **legacy data** in the L1 migration pass once triggers and callers are gone; **dummy/dev data loss acceptable** — only unified `activity_event` (and approved new tables) remain. Resolve `activity_location` FK legacy references (already on `activity_id`). | Count zero new writes; migration on disposable DB; no requirement to preserve legacy row content.                                         |

**Rollback constraint:** Until **L1e**, production must keep `db:migrate`-applied triggers (`db:push` is insufficient). Any slice that removes triggers must ship a **forward-only** migration with a documented restore path (re-apply prior migration SQL from git), aligned with Phase 8.

**Unified clear behavior (unchanged intent):** User-initiated clear continues to remove canonical `activity_event` rows and linked legacy copies **while triggers exist**; after L1e, clear affects only `activity_event` + tombstones.

## Architecture (layer map)

| Decision                     | Choice (after approval)                                                      | Notes                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Target resolution            | `@modules/activity` server (`activity.target-resolver.ts`)                   | Viewer context from session                                                           |
| Resource / cross-app URLs    | **R1** interim v1; **R2** = product target (Auth + Studio + Console) — P7 Q9 | `STUDIO_APP_URL`, `CONSOLE_APP_URL` from `@packages/t3-env/server` for cross-app hops |
| Console administration links | **C1** (unchanged)                                                           | `CONSOLE_APP_URL`, `CONSOLE_ADMIN_EMAILS`                                             |
| Legacy retirement            | **L1** phased removal                                                        | Migrations in `@packages/drizzle`                                                     |
| Legacy tables (L1f)          | **Drop** when triggers and callers are gone (L1f-A)                          | After L1e + retention cross-check if needed                                           |
| Producers                    | `@modules/security`, `@modules/profile`, etc.                                | Single `recordActivity` path                                                          |
| Compatibility HTTP           | `apps/auth` → `@modules/activity/server` transport                           | Remove in L1d                                                                         |

## Environment

No new variables for **R1** / **L1**. **R2** uses existing optional `STUDIO_APP_URL` (see `apps/auth/.env.example`). Console links continue to use `CONSOLE_APP_URL` and `CONSOLE_ADMIN_EMAILS`.

## End-to-end flow

### v1 interim (R1 — resource category)

1. User opens Account → Activity → Resource **only if** nav is shown (when safe targets exist or policy allows honest limited feed).
2. Feed returns rows with `canViewTarget: true` and `targetUrl` when the resolver has a safe in-app link (e.g. `/account/activity/resource?activityId=…` for registered `resource.*` without params).
3. Click **redirects** within Auth; highlight + detail popover behave like account targets. Rows without safe target: **no** redirect affordance.

### Product target (P7 Q9 — cross-app)

4. Timeline rows across **Auth**, **Studio**, and **Console** (where events are produced) resolve to the **permitted app URL** when `canViewTarget: true`—account routes with `?activityId=`, `console.*` under admin rules (C1), `resource.*` to Studio when authorized (R2 slices).
5. Rows without a safe href: **hide** navigation affordances; detail/summary still permitted where policy allows.

## Gaps / open questions

Answer in this doc (or reply in chat); implementation waits for sign-off.

### Resource deep links

- [x] **Pick R1, R2, R3, or R4** for v1 — **R1** (Auth interim) — **2026-11-14**; **refined batch:** redirect when resolver has link; hide nav when no safe target.
- [x] **Long-term deep-link target (P7 Q9)** — **Yes:** cross-app (Auth + Studio + Console per resolver + permissions); **not** Auth-only forever — **2026-11-14** (clarification batch).
- [ ] If **R2**: which `resourceType` values and Studio path templates are in v1 (project, file, other)?
- [ ] Cross-app navigation: new tab vs same tab for Studio/Console activity links?
- [ ] Should resource feed stay in nav under **R1** with honest “limited” copy, or **R4** hide until events exist?
- [ ] Locale on cross-app links: keep Console’s fixed `en-us` path segment vs viewer’s current `[lang]`?

### Legacy retirement

- [x] **Pick L1, L2, L3, or L4** — **L1** phased retirement — **2026-11-14**.
- [x] **Latest data path only (P7 Q10)** — unified `activity_event` + `recordActivity`; **complete L1**; drop legacy tables/APIs/triggers; **no long-term dual-write** — **2026-11-14** (clarification batch).
- [x] After retirement, **drop** legacy tables (**L1f-A**) or **archive read-only** (**L1f-B** / L3)? — **Drop tables + legacy data when triggers/callers gone (L1f-A)** — **2026-11-14 batch** (dummy data OK).
- [ ] Any external system still reading `GET /auth/api/account/activity` or legacy oRPC? (If yes, sunset timeline.)
- [ ] Confirm dual-write producers list is complete: profile, provider unlink, session hooks—any other writers to `user_activity` / `security_activity`?
- [ ] Align timing with [account-data-retention-deletion.md](./account-data-retention-deletion.md) if soft-delete retains activity history in place.

### Console (recorded 2026-11-14)

- [x] **C1** unchanged — admin Console deep links per current resolver rules.

### Sign-off bundle

- [x] User confirms: resource v1 (**R1**) + cross-app target (**R2** / P7 Q9) + console (**C1**) + legacy phase plan (**L1** / P7 Q10) + table fate (**drop**) + **no dual-write** — **2026-11-14** (**partial**; not full doc **“approved”**).
- [ ] User says **“approved”** on the **full** requirements doc (remaining gaps above).
- [ ] User says **“go implement”** before any code/migration slice.

## Implementation slices (after approval)

1. **Policy-only (R1/C1):** Update i18n/copy if needed; document resolver as normative; no Studio URLs.
2. **L1a:** Caller audit doc + deprecation notice draft.
3. **L1b–L1c:** Producer + client migration (single PR slice per phase).
4. **L1d–L1f:** API removal + Drizzle migration (coordinate with Phase 8).
5. **R2 (optional later):** New requirements amendment + Studio authorization + path templates + tests.

## Validation checklist (before sign-off)

- [x] Resource option explicitly chosen (not “interim code” only) — **R1**, 2026-11-14.
- [x] Legacy retirement option and L1f table fate chosen — **L1** + **drop**, 2026-11-14.
- [x] Console option chosen — **C1**, 2026-11-14.
- [ ] No unnamed Studio path templates or guessed metadata URLs.
- [x] Rollback / `db:migrate` constraint acknowledged for trigger removal — Phase 8 review [../phase-8-activity-migration-verification.md](../phase-8-activity-migration-verification.md), 2026-11-14.
- [ ] Cross-links updated in [application-activity.md](./application-activity.md) open items when approved.
- [ ] User confirmed **full** sign-off recorded above.

## Approval

| Field                            | Value                                                                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Resource deep links (v1)         | **R1** — Auth interim; redirect when safe link; hide nav/affordance when no safe href                            |
| Deep-link product target (P7 Q9) | **Cross-app** — Auth + Studio + Console where resolver + permissions allow (**R2**); not Auth-only forever       |
| Console links                    | **C1** — unchanged (admin Console links)                                                                         |
| Legacy retirement (P7 Q10)       | **L1** — complete retirement; **latest only** (`activity_event` + `recordActivity`); **no long-term dual-write** |
| Legacy tables (L1f)              | **Drop** tables + legacy data when triggers/callers gone (dummy data OK)                                         |
| Partial choices recorded         | **2026-11-14** (user chat + clarification batch Q9/Q10)                                                          |
| Full doc status                  | **Not approved** — say **“approved”** to complete; roadmap checkbox stays unchecked until then                   |
| Approved by                      | _pending full sign-off_                                                                                          |
| Full approval date               | _pending_                                                                                                        |
