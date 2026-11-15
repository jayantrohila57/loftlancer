# Plan: Shared action identity and application activity

**Status:** **Implemented (DB + server + initial UI)** — migrations `0004`–`0006`, unified oRPC feed/detail/clear, unified timeline views, destination highlight (`?activityId=`), provider-link recording, and provider-unlink dedupe. **Open:** authenticated browser QA; failed sign-in attribution without a safe owner (still **out of scope** — no policy change without requirements); **legacy retirement (L1)** per [activity-deeplinks-legacy-retirement.md](./activity-deeplinks-legacy-retirement.md) — **product target: latest stack only** (`activity_event` + `recordActivity`; drop legacy tables/APIs/triggers; **no long-term dual-write**, P7 Q10); page-visit / every-click collection still undecided per review below. **Target resolvers:** **Product target (P7 Q9):** deep links across **Auth**, **Studio**, and **Console** where resolver + permissions allow; hide nav when no safe href. **v1 interim:** `resource.*` → `/account/activity/resource` until Studio producers + auth rules ship; `console.*` / administration → cross-app when viewer matches Console admin checks (`CONSOLE_ADMIN_EMAILS` + verified email + `admin` role). Normative spec: [activity-deeplinks-legacy-retirement.md](./activity-deeplinks-legacy-retirement.md) (**partial approval** — full **“approved”** still open).

**Layers:** packages / modules / apps.

**Related:** [Existing activity/location rules](./session-activity-location.md), [module structure](./module-structure.md).

## 1. Define identity first

- Register every supported action/event with a stable `actionId`, such as `account.profile.update`. Its definition provides category, validation, critical-change policy, and target resolver.
- Generate a unique `activityId` on the server before handling each occurrence, including authorization. Carry it through execution, logs, audit, analytics, and activity. Retries of the same occurrence reuse it; a new occurrence gets a new ID. Better Auth currently reserves IDs before its database hooks, not before the entire OAuth flow; hooks without endpoint context fall back to after-hook allocation. Full pre-authorization identity remains open.
- `actionId` identifies what can happen; `activityId` identifies exactly what happened. Future permission rules can reference `actionId`; an `activityId` never grants access.
- Derive category from the action definition. Categories are extensible strings, not separate tables or a fixed database enum. New actions/categories should not require schema changes.
- One occurrence creates one activity record, even across several views. Separate lifecycle events receive separate IDs and can share a `correlationId`.

## 2. One schema for every category

Use one `activity_event` table for user, login, security, privacy, preference, resource, and future activity.

| Fields                                                | Purpose                                             |
| ----------------------------------------------------- | --------------------------------------------------- |
| `activityId`, `actionId`, `category`, `schemaVersion` | Shared identity and contract                        |
| `ownerUserId`                                         | Whose history contains the event                    |
| `actorType`, `actorUserId`                            | Who acted: user, system, or integration             |
| `outcome`, `occurredAt`, `recordedAt`                 | Observed result and server timestamps               |
| `sourceApp`, `sourceModule`                           | Where it happened                                   |
| `resourceType`, `resourceId`                          | Optional affected resource                          |
| `beforeValue`, `afterValue`                           | Nullable JSONB; critical changes only               |
| `metadata`                                            | Validated, bounded JSONB for event-specific context |
| `target`                                              | Optional structured page/section reference          |
| `correlationId`                                       | Optional link between related occurrences           |
| `sessionId`, `ipAddress`, `userAgent`                 | Optional safe context; never tokens                 |

Keep consent-controlled location data separate, linked by `activityId`. Index owner/time/ID and owner/category/time/ID. Unique `activityId` prevents duplicate recording on retries.

**Before/after:** disabled by default. Critical action definitions allow specific fields, such as a changed permission or privacy setting. Read the real previous value server-side and save the actual resulting value. Save only changed, permitted fields; ordinary events leave both columns null. Distinguish an omitted field from a field changed to null. Never copy whole objects, passwords, tokens, or secrets. Filter values for the viewer's permissions.

## 3. Click → page → highlight → activity card

1. Timeline rows show actor, action, summary, time, category, and outcome, inspired by the supplied image.
2. The server returns a viewer-specific `canViewTarget` flag and a resolved link only when allowed. Compute this flag from current access; do not store it permanently on the event.
3. Clicking the action opens its page with `activityId`, for example `?activityId=<id>`. The destination rechecks access, resolves the target, scrolls to it, and highlights the affected section/item.
4. That navigation click triggers an anchored activity card. An Activity button can reopen it. Use a click/keyboard-triggered popover styled like a hover card; hovering alone never opens it.
5. The card shows who acted, what happened, when, outcome, and permitted details, including critical before/after values. Label historical values separately from current page content.
6. Denied access returns `canViewTarget: false`, disables navigation, and shows an unavailable indicator. A Details button can still show a permitted event summary. Deleted/missing targets show an unavailable state.

Use trusted route/section resolvers and existing locale/app URL helpers. Never execute metadata URLs. Tampered IDs cannot expose another user's event/resource. Opening activity never repeats the original action.

## 4. Capture and access

- All modules use one server-only recording API with registered validation. Resolve owner/actor from trusted context. Client clicks cannot invent completed actions or security events.
- Record actual outcomes. Save application mutations and activity in one transaction where possible. Auth continues during activity-write failures; report recording gaps safely.
- List/detail/target/delete operations enforce user and resource permissions. Return permitted fields, not raw rows. Owner and actor can differ.
- One server-paginated feed supports category/action/outcome/date filters and stable `(occurredAt, activityId)` cursors. Use existing response envelopes, UI components, localization, and time formatting.
- Keep history until user deletion, as already agreed. Preserve location consent and separate location deletion. Clearing history must not revoke sessions or allow backfills/retries to restore deleted data.

## 5. Build order

1. Inventory actions; register stable action IDs, categories, critical fields, and targets. Add shared occurrence-ID creation first.
2. Add unified schema/API. Migrate both old activity tables and location links, preserving timestamps, ownership, contracts, and concurrent writes/deletions. Map legacy IDs; do not guess historical duplicates.
3. Instrument existing auth/session, profile/provider, privacy/location, regional, and appearance operations. Add other real application actions using the same contract.
4. Build timeline/filter/detail APIs, permission flags, destination highlights, and triggered cards. Keep app routes thin.
5. Test ownership, critical changes, IDs/retries, migration/deletion, allowed/denied/deleted targets, and click/keyboard behavior. Run focused tests, affected typechecks, `pnpm test`, `pnpm check`, and authenticated browser checks.

Schema: `packages/drizzle`. Activity logic/UI: `modules/activity`. Producers: its public server API. Preserve existing uncommitted work. Reuse current infrastructure.

**Review:** Database work is approved. Page-visit/every-click collection remains undecided; start with meaningful observed operations. Application integration and UI follow the [requirements workflow](../../workflow/04-requirements-first.md).

## Database slice

- Shared schema: `activity_event`, with caller-supplied IDs, optional critical before/after JSONB, structured target, owner/actor references, validation constraints, and feed indexes. Viewer permission flags remain computed by the future API.
- Migration `0004_shared_activity_event.sql` backfills namespaced legacy IDs and links locations. Historical actors remain unknown because the old tables do not record them. Preserve legacy duplicates and original event details.
- Transitional triggers mirror legacy writes/updates/deletes; canonical deletion removes the corresponding legacy copy. Location links reject owner mismatches; deleting history clears references and preserves coordinates. Keep these triggers until producers and readers migrate, then remove them in a later migration.
- Apply with `db:migrate`, not `db:push`: schema push does not install custom SQL triggers. Migration 0005 retains only a digest of deleted event IDs to reject retries that would restore cleared history.
- Local result: 5 historical events migrated; all 48 location records and the existing event link preserved. Seven isolated PostgreSQL migration tests (including `0006` provider dedupe) and `pnpm check` passed when `DATABASE_URL` is set.
- Existing local preference schema already contained migrations 0002/0003 without ledger entries. Verified their columns/constraints and earlier migration hashes before recording those entries, then applied 0004 through `db:migrate`. All five applied migration hashes verified.

## Server slice

- Added action registration, occurrence IDs, validated recording and owner-scoped feed/detail/clear oRPC procedures. Account target links are allowlisted; resource targets await permission-aware resolvers.
- Location privacy and regional/appearance changes are recorded transactionally. Existing profile, sign-in, sign-out, session and provider-unlink hooks continue through the compatibility bridge, now with actors where known.
- OAuth provider linking is recorded when the session matches the account owner. Failed sign-in attribution is still omitted without a safe owner. Legacy provider unlink uses a single canonical security row (migration 0006). Activity overview, user, and login views use the unified feed; legacy list/delete APIs remain for compatibility and data-management clears both stores.

## UI slice

- Unified timeline rows (overview, user activity, login activity) consume the owner-scoped feed; filters and stable cursors match the server contract.
- `ActivityDestinationHighlight` in the auth account layout reads `?activityId=`, resolves allowlisted account targets, scrolls/highlights, and opens the anchored detail popover.
- Clear-history flows use unified `activity.clear`; compatibility triggers remove matching legacy rows in the same transaction.

## Verification (2026-11-10)

- `pnpm check`: passed (format, i18n node tests 79/79, vitest 20 passed / 14 skipped without `DATABASE_URL`, biome lint 1 nursery warning in `packages/ui` sidebar, typecheck 19/19).
- Focused DB tests with `apps/auth/.env`: `tests/activity-migration-db.test.tsx` **7/7**, `tests/activity-api-db.test.tsx` **7/7** (**14/14** total). Destination highlight/denied-state component tests: **2/2**.
- Migrations journal `0004_shared_activity_event` → `0005_activity_deletion_guard` → `0006_activity_provider_compat`; snapshot `prevId` chain consistent (`0003` → `0004` → `0005` → `0006`).
- Local `pnpm --filter @packages/drizzle db:migrate`: applied successfully; run **`db:migrate`** (not `db:push`) on each environment that needs triggers `0004`–`0006`.

## Verification — Phase 8 migration / legacy (2026-11-14)

**Report:** [../phase-8-activity-migration-verification.md](../phase-8-activity-migration-verification.md) (code + docs review; no DB commands this pass).

- **Transitional stack** (`activity_event` + legacy tables/triggers `0004`–`0006`) is consistent with inventory above and isolated DB tests (not re-run here).
- **`db:migrate` only** for triggers; `0007`–`0011` do not modify activity SQL.
- **Unified clear** uses `activity.clear` + tombstones; legacy cascade via `activity_delete_legacy`.
- **L1 retirement** ([activity-deeplinks-legacy-retirement.md](./activity-deeplinks-legacy-retirement.md)) is **direction only** until full sign-off; dual-write producers and legacy list/delete APIs remain by design until **L1b–L1f**.

## Open items (explicit)

| Item                         | Notes                                                                                                                                                                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser QA                   | Manual pass: timeline links, nested regional highlight, popover reopen, denied/deleted targets                                                                                                                                                                          |
| Failed sign-in recording     | **Intentionally omitted** — no Better Auth hook attributes failures to a verified owner; only `session.create` records successful `auth.sign_in`. **Policy:** [activity-failed-sign-in-page-visits.md](./activity-failed-sign-in-page-visits.md) (draft).               |
| Resource / cross-app targets | **Partial sign-off** — v1 **R1** (Auth interim); **product target R2** cross-app (Auth + Studio + Console, P7 Q9) in [activity-deeplinks-legacy-retirement.md](./activity-deeplinks-legacy-retirement.md); hide affordance when no safe href                            |
| Legacy compatibility         | **Partial sign-off** — **L1** complete retirement chosen (P7 Q10): `recordActivity` only, drop legacy tables/APIs/triggers, **no dual-write**; [activity-deeplinks-legacy-retirement.md](./activity-deeplinks-legacy-retirement.md); full doc **“approved”** still open |
| Broad action inventory       | Instrument additional app actions beyond current auth/profile/preferences/location hooks                                                                                                                                                                                |
| Auth identity timing         | Better Auth reserves IDs before database operations when endpoint context is available; carrying one ID from the start of an OAuth flow requires additional integration.                                                                                                |
| Page-visit collection        | Undecided; meaningful observed operations only for now. **Policy:** [activity-failed-sign-in-page-visits.md](./activity-failed-sign-in-page-visits.md) (draft).                                                                                                         |

### UI integration (2026-11-10)

- `ActivityDestinationHighlight` in auth account layout: scroll/highlight, detail popover, `Escape` dismiss, `replaceState` drops `activityId` after anchor.
- Unified `UnifiedActivityFeed` on overview (all scopes), user activity (`account`), login activity (`security`).
- `useClearActivity` wired via `useActivityApi.useClear` in data management (unified clear + legacy delete).
- `activityTarget` on account frames: profile, sessions, providers, permissions, appearance, regional (overview + nested language-region forms).
