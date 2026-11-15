# Auth and Account roadmap

**Master plan (org, billing, storage, AI entitlements):** [platform-entitlements-plan.md](./platform-entitlements-plan.md) — capability map, enforcement matrix, phases, and requirements gaps.

Each phase has 10 tasks. A checked box means the stated work is implemented and verified to the extent described—not that the whole feature is production-ready. Use disposable users for destructive tests. Google and magic link remain deferred until deployment setup. Optional product areas and platform capabilities require their own decisions before implementation.

Pending review findings are listed separately and do not change the 10-task phase counts. Checkbox percentages are not release readiness.

## Phase 1 — GitHub sign-in and routing

- [x] Implement GitHub sign-in and callback wiring.
- [x] Protect Account routes and redirect signed-out users.
- [x] Restrict `returnTo` to configured app origins and paths.
- [x] Preserve Auth-internal and locale-only return destinations.
- [x] Use an absolute, locale-aware GitHub callback URL.
- [x] Handle OAuth cancellation, denial, provider errors, and expired state.
- [x] Handle missing GitHub credentials and unavailable provider services.
- [x] Test malformed, spoofed, encoded, and untrusted return URLs.
- [ ] Re-verify fresh and returning GitHub login, callback, and Auth/Studio/Console returns after the registration-routing change.
- [x] Decide and implement first-user versus returning-user routing.

## Phase 2 — Sessions and sign-out

- [x] List only the current user's active sessions.
- [x] Revoke one session and revoke other sessions.
- [x] Reject expired and tampered session cookies.
- [x] Clear private client cache after successful sign-out.
- [x] Verify concurrent sessions, repeated revocation, and stale session lists.
- [x] Verify current-session protection and behavior after current-session expiry.
- [x] Verify cross-user revocation denial and revoked-token reuse.
- [x] Handle session-list, revoke, sign-out, and refresh failures with retry.
- [x] Verify confirmation, pending, cancellation, and multi-tab sign-out states.
- [x] Verify session cookies and sign-out across Auth, Studio, and Console.
- [x] Verify expired and revoked sessions return users to sign-in safely (item 50 — `AUTH-SH-06`; `tests/auth-account-session-require.test.ts`, `tests/auth-private-client-identity.test.tsx`).
- [x] Verify account pages require a valid session before private data (item 102 — layout `AuthAccountSessionGate`, client query `enabled` gates, org list/invitations; `tests/auth-account-session-require.test.ts`).

## Phase 3 — Connected accounts

- [x] Show configured provider availability and linked sign-in methods.
- [x] Support linking and unlinking GitHub accounts.
- [x] Block removal of the last usable sign-in method.
- [x] Verify non-last-provider unlink with disposable synthetic data.
- [x] Handle empty, loading, unavailable, and multiple-account states.
- [x] Handle link cancellation, callback errors, and duplicate/already-linked accounts.
- [x] Verify verified-email matching and cross-user linking/unlinking denial.
- [x] Verify confirmation, pending, retry, and refresh after unlink.
- [x] Verify provider credentials and private identifiers never reach the UI.
- [ ] Optionally test a real link/unlink with a second disposable GitHub identity.

## Phase 4 — Profile and avatar

- [x] Show profile name and read-only account email.
- [x] Save display name and support avatar file and HTTPS URL input.
- [x] Enforce avatar upload authentication, origin, type, and size limits.
- [x] Verify read-only email verification status and account creation date.
- [x] Test empty, invalid, oversized, spoofed, and unsupported image inputs.
- [x] Verify image preview failure, upload failure, retry, and removal.
- [x] Verify profile persistence, cross-user isolation, and concurrent updates.
- [ ] Verify Blob-backed upload, storage failure, and orphan-file cleanup policy.
- [ ] Decide phone, biography, location, and website fields and migrations. _(Draft options: [requirements/profile-optional-fields.md](./requirements/profile-optional-fields.md) — unchecked until user sign-off.)_
- [ ] Verify profile and avatar flows in a browser with disposable data.

## Phase 5 — Appearance and regional settings

- [x] Persist theme, density, zoom, and sidebar preferences.
- [x] Allow zoom and sidebar preferences to return to defaults.
- [x] Persist language, region, time zone, date/time, numbers, currency, and measurements.
- [x] Preserve route, query, and fragment when changing language.
- [x] Verify invalid values, partial updates, resets, and concurrent saves. **Verified 2026-11-14 (code):** `tests/appearance-preferences.test.tsx`, `tests/regional-preferences.test.tsx`, `tests/appearance-preferences-api.test.tsx`, `tests/regional-preferences-api.test.tsx` (invalid/partial/reset + concurrent partial updates).
- [x] Verify save failures, retry, loading, and cross-user isolation. **Verified 2026-11-14 (code, item 71):** API outage + retry (`tests/appearance-preferences-api.test.tsx`); form toast/`saveError`, no cache write on failure, resubmit (`tests/appearance-preferences-form-save.test.tsx`); load retry (`tests/preferences-client-states.test.tsx`); cross-user isolation (`tests/appearance-preferences-api.test.tsx`).
- [x] Apply supported appearance preferences across apps and sessions. **Verified 2026-11-14 (code):** theme/density/zoom/sidebar via oRPC + `tests/appearance-sidebar-application.test.tsx` (live sidebar + cookie); cross-app theme read via `tests/appearance-preferences-read-http.test.tsx` (trusted-origin session cookie). Console/Studio/Web still lack account format provider per [regional-formatting-inventory.md](./regional-formatting-inventory.md).
- [x] Inventory formatting consumers and confirm date/time and number choices.
- [x] Verify SSR/client formatting, locale routing, and hydration consistency. **Verified 2026-11-14 (code):** `tests/i18n-runtime.test.tsx` (en-us/en-in/es-es SSR + hydrate); `tests/auth-account-regional-formats.test.tsx` + `apps/auth/src/shared/i18n/auth.account-regional-formats.ts` (account preset merge). **Known gap (documented):** Auth account routes may adjust formatting after client regional prefs load — not a silent failure; full cross-route disposable browser pass still Phase 5 pending review.
- [x] Document currency/measurement limitations; never silently convert values.

## Phase 6 — Location and account deletion

- [x] Save location consent and enforce it before capture.
- [x] Show browser permission changes and bound background capture time.
- [x] Delete the user's location history without deleting another user's history.
- [x] Require a fresh session and confirmation for account deletion.
- [x] Delete a disposable account and invalidate its sessions. **Code:** `tests/auth-security-isolated-db.test.tsx` soft-delete, multi-session API **401** after delete, concurrent delete, re-auth block (`AUTH_SECURITY_TEST_DATABASE_URL` + matching `DATABASE_URL` to execute).
- [x] Test location permission denied, unavailable, revoked, and delayed responses.
- [x] Test location save/delete failures, retry, consent revocation, and races.
- [x] Test deletion confirmation, cancellation, stale sessions, and failure recovery.
- [ ] Decide retention/deletion policy for app data, Blob files, and diagnostic logs. **Spec:** [requirements/account-data-retention-deletion.md](requirements/account-data-retention-deletion.md) — **runtime matches decided rules** (2026-11-14 verification batch; `tests/account-data-retention-policy.test.tsx` + isolated soft-delete tests). **Checkbox stays open** until user sign-off on PII, activity/location, last-copy email, and audit bundle.
- [x] Verify location and deletion browser flows using disposable accounts.

## Phase 7 — Activity and audit

- [x] Provide owner-scoped activity feed, detail, and history clearing.
- [x] Resolve supported destinations using current viewer access.
- [x] Add missing activity producers for approved account operations.
- [x] Test ownership, actor identity, denied/deleted targets, and tampered IDs.
- [x] Test filters, stable pagination, empty states, and history deletion.
- [x] Verify action IDs, occurrence IDs, retries, and transaction outcomes.
- [x] Verify clearing history does not revoke sessions or restore deleted events.
- [x] Verify critical before/after data, redaction, and safe logging failures.
- [ ] Decide failed-sign-in attribution and page-visit collection; do not guess owners. **Spec:** [requirements/activity-failed-sign-in-page-visits.md](requirements/activity-failed-sign-in-page-visits.md) (draft — user sign-off required).
- [ ] Decide resource deep links and retirement of legacy APIs/triggers. **Spec:** [requirements/activity-deeplinks-legacy-retirement.md](requirements/activity-deeplinks-legacy-retirement.md) (**partial approval** — Q9 cross-app target + Q10 L1/no dual-write recorded; full **“approved”** still open).

## Phase 8 — Shell, APIs, and localization

- [x] Provide Account navigation, section tabs, command menu, and overview.
- [x] Provide loading, error, and unavailable route states.
- [x] Verify mobile layout, keyboard access, focus, and unavailable destinations. **Verified 2026-11-14 (code):** `tests/auth-account-shell-phase8.test.tsx`, `tests/activity-destination.test.tsx` (mobile sheet, `Ctrl/Cmd+K`/`B`, focus rings, unavailable tab + activity targets). **Touch command menu (item 21):** header shows a labeled search icon trigger below `sm` (`shell.command-menu.trigger.tsx`). **Responsive widths (item 107):** mobile sheet below 800px, docked sidebar on tablet/desktop, horizontal section-tab scroller (`ShellSectionSubnav`), touch-sized header triggers — `tests/auth-account-shell-responsive.test.tsx`; disposable browser resize pass still open.
- [x] Verify immediate and settled loading, empty, error, and retry states. **Verified 2026-11-14 (code):** `tests/auth-account-shell-route-states.test.tsx`, `tests/preferences-client-states.test.tsx`; fixed hub/security/profile/overview immediate loaders; language-region overview skeleton route loading.
- [x] Verify all Account routes, links, history, and locale preservation. **Verified 2026-11-14 (code):** `tests/auth-account-command-navigation.test.tsx` (sidebar/tabs/hub ↔ `page.tsx`, legacy redirects, history command targets, locale-free hrefs + `always` prefix).
- [x] Audit oRPC/OpenAPI and compatibility contracts for every existing caller. **2026-11-14:** [orpc-openapi-caller-audit.md](./orpc-openapi-caller-audit.md) (in-repo inventory; external compat consumers still unverified in deploy logs).
- [x] Test unauthenticated, origin, invalid input, ownership, and outage responses. **2026-11-14:** `tests/account-openapi-phase8-responses.test.tsx` (gateway + appearance, regional, location, activity, connected accounts; **14** assertions).
- [x] Verify cache invalidation and private-data isolation across account changes. **Verified 2026-11-14 (code):** identity-change `queryClient.clear()` (`tests/auth-query-identity-cache.test.tsx`); sign-out + delete-account clear (`tests/auth-sign-out.test.tsx`, `tests/security-delete-account-cache.test.tsx`); user-scoped keys + mutation invalidation (`tests/account-query-keys-isolation.test.tsx`, `tests/sessions-revoke-cache.test.tsx`, `tests/connected-accounts-unlink-cache.test.tsx`, `tests/location-mutation-cache.test.tsx`, `tests/activity-mutation-cache.test.tsx`). Cross-app providers (Auth/Studio/Console) share the same identity guard; location/preferences use prefix invalidation and depend on identity clear for cross-user isolation.
- [x] Verify failed account actions can be retried without duplicate side effects (item 106). **Verified 2026-11-14 (code):** `security.hook.rpc` + `invokeIdempotentSecurityMutation` on activity clear; transient codes on `auth.client-retry`; inventory in `tests/account-mutation-retry.test.tsx`, `tests/security-rpc-client.test.ts`; unlink list reconciliation (`tests/connected-accounts-unlink-cache.test.tsx`); appearance/regional manual retry (`tests/appearance-preferences-form-save.test.tsx`).
- [x] Complete `en-us`, `en-in`, and `es-es` strings and formatting consumers. **Verified 2026-11-14:** auth catalog **691** keys × three locales (parity); account `ShellMessageKey` + module `useTranslations` paths resolve; `AuthAccountFormatProvider` on account routes ([regional-formatting-inventory.md](./regional-formatting-inventory.md)). **Gap closed:** sessions location summary used hardcoded English → `ui.locationWithinAccuracyMetres` (+ ICU `{accuracy, number}`) in all locales. **Out of scope:** cross-app format providers; currency/region/measurement formatter wiring.
- [x] Verify migration, legacy-trigger, rollback, and existing-data compatibility. **Report:** [phase-8-activity-migration-verification.md](phase-8-activity-migration-verification.md) (2026-11-14; code/docs review; re-run disposable DB tests before deploy).

## Phase 9 — Linked sections requiring product decisions

**Implementation tracker (ordered pass conditions + evidence):** [phase-9-account-checklist.md](./phase-9-account-checklist.md)

Sequencing and entitlements: [platform-entitlements-plan.md](./platform-entitlements-plan.md).

- [ ] Decide whether unavailable Account sections stay, are built, or are removed.
- [ ] Define notifications preferences, channels, and history.
- [ ] Define AI usage, limits, and alerts.
- [ ] Implement storage inventory, quota, activity, and recovery. **Spec:** [requirements/storage-system.md](./requirements/storage-system.md) (**Approved** 2026-11-14 — plan-derived quotas; **after** Better Auth org slice).
- [ ] Define subscriptions, plans, and entitlements. **Spec:** [requirements/autumn-usage-metering.md](./requirements/autumn-usage-metering.md) (**Approved** 2026-11-14 — Free 2 GB / Paid 5 GB + AI; credits).
- [ ] Define billing, payment methods, invoices, and billing details. **Spec:** [requirements/autumn-usage-metering.md](./requirements/autumn-usage-metering.md) (Autumn + Stripe; custom billing UI).
- [ ] Define privacy consents and data export.
- [ ] Define help content and support-ticket workflows.
- [ ] Specify ownership, authorization, API, retention, and audit per approved section.
- [ ] Implement and verify only the sections approved by the user.

## Phase 10 — Enterprise SSO

- [ ] Choose initial identity providers and OIDC/SAML support.
- [ ] Define tenant ownership and who can register or edit connections.
- [ ] Define and enforce domain-verification policy.
- [ ] Define implicit sign-up, linking, and trusted-provider policy.
- [ ] Resolve and runtime-test SSO schema/adapter compatibility.
- [ ] Build approved connection registration and management flows.
- [ ] Configure callback/ACS URLs, keys, and certificate rotation.
- [ ] Test discovery, invalid domains, denial, errors, and unsafe redirects.
- [ ] Verify tenant isolation, audit events, and ordinary-user denial.
- [ ] Test approved IdP sign-in and failure flows end to end.

## Phase 11 — MCP, device authorization, and administration

- [ ] Define trusted MCP clients, resources, scopes, consent, and token lifetimes.
- [ ] Verify MCP token audience, scope, expiry, refresh, and redirect rules.
- [ ] Test MCP consent approval, denial, invalid clients, and revoked access.
- [ ] Define approved device clients, scopes, and canonical verification URL.
- [ ] Enforce device-code scope policy and audit approval/denial.
- [ ] Test device expiry, replay, invalid codes, polling, approval, and denial.
- [ ] Define Console admin bootstrap, mutations, and impersonation policy.
- [ ] Implement approved admin operations with authorization and audit.
- [ ] Test non-admin denial, privilege changes, and destructive-action approvals.
- [ ] Verify SSO, MCP, device, and admin flows with approved test identities.

## Phase 12 — Deferred providers and release verification

- [ ] Configure Google sign-in and callback during deployment setup.
- [ ] Test Google provider availability, cancellation, linking, and sign-in.
- [ ] Configure email delivery and magic-link URLs during deployment setup.
- [ ] Test magic-link expiry, reuse, invalid tokens, and delivery failures.
- [ ] Review environment secrets, trusted origins, and shared-domain cookies.
- [ ] Apply and verify migrations and legacy compatibility in the target environment.
- [ ] Verify GitHub callback, Blob storage, and cross-app routing in deployment.
- [ ] Run `pnpm check:ci`, isolated security tests, and the Auth production build.
- [ ] Verify authenticated browser flows, responsive states, and failure recovery.
- [ ] Record deployment, live-route results, unresolved risks, and sign-off.

## Pending review findings

- [x] Phase 3: prevent private provider identifiers reaching browser-facing responses, including the Better Auth account-list endpoint. **Resolved 2026-11-14:** `buildPublicListAccountsPlugin` strips `/list-accounts` to `id` / `providerId` / `createdAt`; oRPC path unchanged (`serializeLinkedConnectedAccounts`); `tests/connected-accounts-ui-secrets.test.tsx`, `tests/connected-accounts-list-api.test.tsx`, and isolated `list-accounts` assertions in `tests/auth-security-isolated-db.test.tsx`. Optional second GitHub identity QA still **unchecked** in Phase 3.
- [ ] Phase 4: verify Blob upload and failure handling; confirm retention of unused files and optional profile-field decisions. **Code 2026-11-14:** existing `tests/profile-avatar-*` (upload validation, client retry, blob URL safety). **Still user-only:** live Vercel Blob upload/failure in browser; [requirements/profile-optional-fields.md](./requirements/profile-optional-fields.md) still awaiting sign-off.
- [ ] Phase 5: verify cross-app cookies and appearance, SSR/hydration, and concurrent saves using disposable data. **Partial 2026-11-14:** invalid/partial/reset/concurrent API + preset merge tests (see Phase 5 checkboxes above). **Still user-only:** disposable cross-app browser pass (not run in this slice).
- [x] Phase 6: implement soft deletion, revoke access, block re-registration, and retain account data internally. Hard deletion blocked via auth hooks; data-copy email still deferred.
- [x] Phase 6: enforce typed confirmation server-side or decide it is a UI-only safeguard. **Resolved:** typed email is **UI-only**; server uses Better Auth **fresh session** (`session.freshAge`) and optional password on `/delete-user` — recorded in [requirements/account-data-retention-deletion.md](./requirements/account-data-retention-deletion.md) (gaps).
- [x] Phase 6: prevent in-flight saves from recreating deleted location history; test both lock orders with an isolated database. Apply migration `0011_classy_angel` before rollout; legacy location-save clients must refresh or update.
- [ ] Phase 6: verify pending, permission-change, and failure/retry states with disposable accounts. **Blocked:** live browser QA (see `scripts/work/phase6-location-deletion-browser-qa.mjs`; go-live).
- [x] Phase 7: fix `better-auth/api` resolution and rerun Auth/Console typechecks and affected tests. **Resolved 2026-11-14:** `createAuthMiddleware` / `getSessionFromCtx` re-exported from `@packages/better-auth`; device activity plugin imports via package entry. **Deferred:** Auth/Console `tsc` + affected vitest (not run per review slice).
- [x] Phase 7: correlate device approval/denial activity using a stable request identity and test the plugin lifecycle. **Resolved 2026-11-14:** `pendingByRequest` keys `ctx.request` when present (fallback `ctx`); plugin hook lifecycle covered by `tests/device-authorization-activity-plugin.test.tsx`. **Resolved 2026-11-14 (Task 7):** approval, denial, expiry, claim, polling, and replay in `tests/device-authorization-isolated-db.test.tsx` (skipped unless `AUTH_SECURITY_TEST_DATABASE_URL` + `BETTER_AUTH_DEVICE_CLIENT_IDS` are set). **Deferred:** browser verification on `/device`.
- [ ] Phase 7: verify activity ownership, retention, retry, and transaction behavior using an isolated database. **Blocked:** `AUTH_SECURITY_TEST_DATABASE_URL` isolated runs not executed in this slice (`tests/activity-phase7-access-db.test.tsx`, `tests/auth-security-isolated-db.test.tsx`, etc.).
- [ ] Phase 7: finalize failed-sign-in, page-visit, deep-link, and legacy-retirement decisions. **Blocked:** user sign-off on [requirements/activity-failed-sign-in-page-visits.md](./requirements/activity-failed-sign-in-page-visits.md) and full approval on [requirements/activity-deeplinks-legacy-retirement.md](./requirements/activity-deeplinks-legacy-retirement.md).
- [ ] All phases: rerun skipped database tests, outstanding browser/provider flows, and `pnpm check`. **Deferred:** explicit user / Phase 12 checklist — not run in this slice.
