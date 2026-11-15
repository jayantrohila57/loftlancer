# Auth app — remaining actions

## Browser recheck — 2026-11-15, after services restarted

This is a partial recheck using the signed-in account. A visible control or empty state does not prove its full workflow works.

- **AUTH-REM-01:** `Sign out` now appears in the command menu. It was not executed; sign-out, cache clearing, and redirect remain unverified in the browser.
- **AUTH-REM-17:** Organization overview shows the active organization and links to Members and Invitations. No settings edit control appeared.
- **AUTH-REM-21:** Received invitations settled to `You have no pending invitations.` The previous loading state cleared. Accept, reject, and expiry cases were not exercised.
- **AUTH-REM-26:** Invoices still show `Could not load invoices. Try again.`
- **AUTH-REM-28–33:** Files now settles to `No files yet` instead of the previous storage-load error. No upload control is visible in the empty state; file actions and quota behavior remain unverified.
- **Location permissions:** The location switch and Delete location history became enabled after loading. Neither action was submitted.
- **Billing:** Overview now displays the Free plan and included storage; it says billing integration is not configured and organization setup is finishing. Available Plans displays Free and Paid but reports that `AUTUMN_SECRET_KEY` is needed for upgrades. No billing action was submitted.
- **AUTH-REM-36:** AI Usage displays the Free plan, zero credits and no recorded invokes, while explaining that no metered AI routes are live. Its page heading still says the feature is unavailable.

Review date: 2026-11-14 · Implementation sweep **2026-11-15** (Phase 9 batches A–HC signed off in [phase-9-product-decisions-request.md](./phase-9-product-decisions-request.md)). URLs use `en-us`; the same routes also use `en-in` and `es-es`. Each ID below is a report ID, not necessarily an application action ID. This list contains implementation and setup work found in the current code and project documents. Completed actions and test-only work are omitted. Shared pages are grouped. The scope and details of proposed features still need the decisions noted below; do not treat them as approved requirements.

The existing `auth-page-action-report.md` contains later edits and remains unchanged. This is a new working list based on the current tree and the live browser notes below, not a claim that every possible gap has been discovered.

## Live browser review — 2026-11-15 (continued)

The Auth dev server was running on port 3002 with an existing signed-in browser session. The database health endpoint returned `{"ok":true}`. No destructive, billing, invitation-send, permission-changing, or provider actions were submitted.

- **Sessions — `/auth/en-us/account/security/sessions`:** The page loaded the current session, two other active sessions, location information, and both `Sign out other sessions` and per-session `Sign out` buttons. The controls were observed but not submitted.
- **Connected accounts — `/auth/en-us/account/security/connected-accounts`:** The page loaded email magic link and GitHub. GitHub was connected, and `Disconnect` was visibly disabled with the reason that it is the only sign-in method. This protection works in the live UI; unlink was not submitted.
- **AUTH-REM-01:** Searching the command menu for `sign out` returned device authorization, sign out other sessions, and sign-in methods. It did not return a current-account `Sign out` command. This remains an actual missing action.
- **AUTH-REM-17:** Organization overview loaded the active organization name and Members/Invitations links. No settings edit controls were visible.
- **AUTH-REM-18:** Members loaded the owner row and an `Invite a member` control. The member mutation actions were not visible for the only-owner row and were not submitted.
- **AUTH-REM-19:** Invitations loaded an email field, role selector, submit button, and an empty pending list. No invitation was sent.
- **AUTH-REM-22:** Consents loaded a location switch and `Delete location history`. The controls were not changed.
- **AUTH-REM-23 / 25 / 38 / 39 / 40:** Data Export, Notifications, Model Usage, Limits & Alerts, and Help & Support visibly remained waiting-for-product-sign-off placeholders.
- **AUTH-REM-26:** Invoices reached `Could not load invoices. Try again.` in the current environment.
- **AUTH-REM-28–33:** Files reached `Could not load files. Try again.` and the server logged `Organization storage is not ready yet` for `security.storage.list`; file actions were unavailable in this state.
- **Profile — `/auth/en-us/account/profile`:** The live screen showed an avatar preview, upload/remove/URL controls, editable display name, and a read-only verified email. No profile mutation was submitted.
- **Appearance — `/auth/en-us/account/appearance/theme`:** The live screen showed System, Light, and Dark radio options plus Reset and Submit controls. No preference was changed.
- **Billing — `/auth/en-us/account/billing`:** The screen first showed no active organization and then `Could not load billing overview. Try again.` No billing or provider action was available in the observed state.
- **Subscription — `/auth/en-us/account/subscription`:** The screen showed the approved tabs and a no-active-organization message. No subscription data or action was available in the observed state.
- **AI usage history — `/auth/en-us/account/ai-usage/usage-history`:** The screen showed the usage-history tab and a no-active-organization message. No ledger rows or pagination were available in the observed state.
- **Activity — `/auth/en-us/account/activity`:** The live feed loaded event filters, activity rows, Details controls, target links, and disabled Previous/Next controls at the first page. Observed rows included location permission updates, sign-ins, and sign-outs. This action is working for the loaded history; pagination was not available with this data set.
- **Device authorization — `/auth/en-us/account/security/device-authorization`:** The live form showed a Device code field and Submit button. No code was entered, so lookup/approval/denial could not be observed.
- **Organizations — `/auth/en-us/organizations/list`:** The live list showed one active organization, its settings button, and Create organization buttons. No organization was created or switched.
- **Account deletion — `/auth/en-us/account/privacy-data/account-deletion`:** The live page showed the Delete account action and the requirement for a fresh session plus typed email confirmation. The deletion action was not opened or submitted.
- **Storage trash — `/auth/en-us/account/storage/trash`:** The page showed the approved 7-day restore description but reported no active organization, so no trash rows or restore action were available.
- **Language — `/auth/en-us/account/language-region/language`:** The live form showed a language selector currently set to Not set, a live preview using English (US), Reset, and Submit. No language was changed.
- **Billing sub-pages — `/auth/en-us/account/billing/payment-methods` and `/payment-history`:** Both showed a no-active-organization state and a link to Organizations. No payment data or management action was available in the observed state.
- **Billing details — `/auth/en-us/account/billing/billing-details`:** The page loaded the billing-details tab and then showed `Could not load billing overview. Try again.` with a visible Try again button.
- **Storage activity — `/auth/en-us/account/storage/storage-activity`:** The page showed a no-active-organization state, so no storage event rows or pagination were available.
- **Account activity — `/auth/en-us/account/activity/account`:** The live page showed Account, Preferences, and Privacy filters, two privacy rows, Details controls, and disabled pagination at the first page.
- **Security activity — `/auth/en-us/account/activity/security`:** The live page showed Login/Security filters, sign-in/sign-out/revocation filters, time filters, seven login/logout rows, Details controls, disabled pagination, and Delete history. It explicitly says failed attempts are not yet recorded. Delete history was not submitted.
- **Region — `/auth/en-us/account/language-region/region`:** The live form showed an Automatic region selector with United States/US preview, Reset, and Submit. No region was changed.
- **Date & time — `/auth/en-us/account/language-region/date-time`:** The live form showed an Automatic Asia/Calcutta time-zone selector, date-style radios, 12-hour/24-hour radios, Reset, Submit, and a formatted preview. No setting was changed.
- **Numbers — `/auth/en-us/account/language-region/numbers`:** The live form showed Not set, Automatic, and No grouping options, a numeric preview, Reset, and Submit. No setting was changed.
- **Currency — `/auth/en-us/account/language-region/currency`:** The live form showed a Not set preferred-currency selector, preview text explaining that transaction currencies do not change, Reset, and Submit. No setting was changed.
- **Zoom — `/auth/en-us/account/appearance/zoom`:** The live form showed Dense, Default, Spacious presets, a 70–130% slider at 100%, Reset, and Submit. No setting was changed.
- **Density — `/auth/en-us/account/appearance/density`:** The live form showed Default, Compact, and Comfortable radio options, Reset, and Submit. No setting was changed.
- **Sidebar — `/auth/en-us/account/appearance/sidebar`:** The live form showed Expanded, Collapsed, and Remember last state options, Reset, and Submit. No setting was changed.
- **Measurements — `/auth/en-us/account/language-region/measurements`:** The live form showed Not set, Metric, US customary, and UK options, a units preview, Reset, and Submit. No setting was changed.
- **Signed-in sign-in redirect — `/auth/en-us/sign-in`:** With the existing session, the route attempted to redirect to `http://localhost:3003/en-us`. The browser could not connect to that destination, so cross-app redirect behavior is currently blocked by the unavailable Studio server. The Auth server itself remained reachable on port 3002.

## Live browser review — 2026-11-15 (in progress)

The Auth dev server was started on port 3002 and the browser had an existing signed-in account. The database health endpoint returned `{"ok":true}`. The checks below describe only what was actually observed; loading a page does not establish that its actions work. This review is incomplete, and the remaining entries in this document have not yet been checked in this browser session. No invitation, deletion, billing, permission, or upload action was submitted.

- **Account navigation:** The account hub opened and its Members link navigated to the Members screen.
- **AUTH-REM-01:** The command menu opened. Searching “sign out” showed “Sign out other sessions” but no current-account sign-out action.
- **AUTH-REM-17:** Organization overview loaded the active organization name and links to Members and Invitations. No settings edit control was visible in the observed view.
- **AUTH-REM-18:** Members showed the signed-in owner and an invitation control. The old claim that the entire screen was unavailable was incorrect. Member mutations were not attempted.
- **AUTH-REM-19:** Invitations showed an email field, a Member role selector, a submit button, and an empty pending list after loading. The old claim that the screen was unavailable was incorrect. Sending and cancellation were not attempted.
- **AUTH-REM-22:** Consents showed a location collection switch and a delete-history control after loading. They were not changed; other consent categories were not shown.
- **AUTH-REM-23 / 25 / 38 / 39 / 40:** Data Export, Notifications, Model Usage, Limits & Alerts, and Help & Support each showed a waiting-for-product-sign-off message. No corresponding workflow was shown.
- **AUTH-REM-26:** Invoices ended at “Could not load invoices. Try again.” Invoice contents and pagination remain untested.
- **AUTH-REM-28–33:** Files ended at “Could not load files. Try again.” Server output for `security.storage.list` said “Organization storage is not ready yet.” The screen did not expose file actions in that state; their behavior remains untested.

The initial server-rendered views sometimes showed “No organization selected” before resolving the signed-in organization. This is an observed loading transition, not proof that the user has no organization.

## All account pages — `/auth/en-us/account/*`

- **AUTH-REM-01 — Sign out from the command menu.** Connect the sign-out command to the existing sign-out workflow, including pending and failure feedback, clearing private client data, and the correct destination after success.
- **AUTH-REM-02 — Handle organization switches safely.** Cancel or isolate requests and clear or refresh organization-scoped data when the active organization changes, so an old response cannot appear under the new organization.

## Sign in — `/auth/en-us` and `/auth/en-us/sign-in`

- **AUTH-REM-03 — Complete Google sign-in setup.** Configure the provider and callback for each deployment, show a useful unavailable state when configuration is missing, and carry users through the existing safe return destination.
- **AUTH-REM-04 — Complete magic-link delivery.** Configure the email provider, sender, and callback URLs; provide a safe delivery-failure message and a usable resend cooldown or rate-limit message.
- **AUTH-REM-05 — Explain provider callback failures accurately.** Handle a provider error with missing OAuth state without presenting it only as an expired session; keep the return link safe.

## Check email — `/auth/en-us/check-email`

- **AUTH-REM-06 — Complete resend protection and feedback.** Add clear cooldown and rate-limit feedback to resend, while preserving the email and safe return destination and allowing the user to change the address.

## Enterprise sign in — `/auth/en-us/sign-in/sso`

- **AUTH-REM-07 — Complete enterprise SSO.** Define approved identity providers, tenant ownership, domain verification and account-linking rules; create authorized connection management, persist the required settings, and connect discovery, callbacks and useful error recovery. Resolve the adapter/schema compatibility as part of that flow. **Needs product decisions:** Phase 10 in [Auth roadmap](./auth-account-roadmap.md).

## App consent — `/auth/en-us/consent`

- **AUTH-REM-08 — Record a denied consent decision.** Add an appropriate registered activity action and record the decision without storing authorization codes or secrets. Keep the existing denial and redirect behavior.

## Profile — `/auth/en-us/account/profile`

- **AUTH-REM-09 — Restore the avatar URL field after a failed save.** Keep the saved avatar and form value consistent when a URL update fails, and offer a clear retry.
- **AUTH-REM-10 — Finish avatar orphan handling.** Define and implement the approved cleanup or retention process for an uploaded Blob when saving the profile fails. Current policy documents manual handling; do not delete existing files without an approved policy. See [avatar requirements](./requirements/profile-avatar-blob.md).
- **AUTH-REM-11 — Add optional profile fields if approved.** Decide which of phone, biography, location, and website belong in the product, then add their fields, validation, persistence, edit/cancel flow, and privacy rules. See [profile field options](./requirements/profile-optional-fields.md).

## Account activity — `/auth/en-us/account/activity`, `/auth/en-us/account/activity/account`, `/auth/en-us/account/security/user-activity`

- **AUTH-REM-12 — Finish activity coverage.** Add approved missing action producers and safe activity records for the account workflows that should appear in the feed. Decide failed-sign-in attribution before creating user-owned records; do not guess the owner. See [activity decisions](./requirements/activity-failed-sign-in-page-visits.md).
- **AUTH-REM-13 — Complete protected activity links.** Resolve billing, storage, and organization targets using the viewer's current organization membership and role; show an unavailable state when access is gone. Add Studio resource links only under the approved deep-link rules. See [deep-link decisions](./requirements/activity-deeplinks-legacy-retirement.md).
- **AUTH-REM-14 — Add activity export if approved.** Define which records can be exported, retention, access rules, and delivery; then provide a request and download flow. Coordinate with account data export below.

## Language and region — `/auth/en-us/account/language-region/*`

- **AUTH-REM-15 — Apply saved formats where they are used.** Connect approved date, time, number, currency-display, and measurement preferences to their actual consumers across the relevant apps. Preserve the rule that a display preference does not silently convert values.
- **AUTH-REM-16 — Complete currency previews.** Make the overview preview reflect supported saved currencies instead of falling back to a limited preset mapping.

## Organization overview — `/auth/en-us/account/organization`

- **AUTH-REM-17 — Complete organization settings.** Show the active organization and connect approved settings to the existing organization setup services. Allow authorized owners to edit and save; show other members a read-only view and handle missing organization and save errors.

## Organization members — `/auth/en-us/account/organization/members`

- **AUTH-REM-18 — Complete member management.** The member list and an invitation control now appear on the screen. Complete any missing approved role-change, removal, and ownership-transfer actions, including confirmation, last-owner protection, server-side permissions, and clear feedback. Follow [organization requirements](./requirements/organizations.md) and [role rules](./requirements/org-roles-rbac.md).

## Organization invitations — `/auth/en-us/account/organization/invitations`

- **AUTH-REM-19 — Complete invitation management.** The screen now shows an email field, role selector, submit button, and pending-invitation list. Complete any missing owner authorization, expiry, cancellation, duplicate handling, and delivery feedback; the submit and cancellation flows have not yet been checked in the browser.

## Create organization — `/auth/en-us/organizations/create`

- **AUTH-REM-20 — Finish provisioning recovery.** Show when organization creation succeeded but the Autumn customer binding is still pending; provide a safe way to resume or retry provisioning without creating a second organization. Handle concurrent creation against the approved ownership limit.

## Received invitations — `/auth/en-us/organizations/invitations`

- **AUTH-REM-21 — Complete expired-invitation handling.** Exclude or clearly mark expired invitations and prevent expired pending invitations from being accepted or rejected as active. Explain when a user is signed in with the wrong account and provide a safe way to switch accounts.

## Privacy consents — `/auth/en-us/account/privacy-data/consents`

- **AUTH-REM-22 — Manage other privacy choices if approved.** This route currently reuses location permissions. Define approved consent types, defaults, purpose, withdrawal and retention, then add user-scoped controls and persistence alongside a link to location settings. See [privacy consent draft](./requirements/account-privacy-consents.md) and decision batch D.

## Data export — `/auth/en-us/account/privacy-data/data-export`

- **AUTH-REM-23 — Create the account data request flow.** Replace the unavailable page after deciding whether export is a support request or a generated download. Define the included data, identity checks, request status, secure delivery, expiry, rate limits, and ownership rules before implementing it. See [product decisions](./phase-9-product-decisions-request.md).

## Account deletion — `/auth/en-us/account/privacy-data/account-deletion`

- **AUTH-REM-24 — Complete retained-data and copy handling.** Decide and present what remains after deletion, how long it remains, and whether the user may request a copy before deletion. Implement the approved handling for personal data, activity, location, files, and audit records. See [retention requirements](./requirements/account-data-retention-deletion.md).

## Notifications — `/auth/en-us/account/notifications`

- **AUTH-REM-25 — Build notification preferences.** After product decisions, replace the unavailable page with the approved notification categories and channels, saved preferences, required security notifications, delivery behavior, and failure feedback. Do not assume an inbox or ticket system is approved. See [notification draft](./requirements/account-notifications.md) and decision batch C.

## Invoices — `/auth/en-us/account/billing/invoices`

- **AUTH-REM-26 — Browse all invoices.** Connect the available next cursor to page controls or load more, keep the active organization and owner access in scope, and retain useful empty and error states.

## Payment methods — `/auth/en-us/account/billing/payment-methods`

- **AUTH-REM-27 — Complete payment-method management.** Establish whether the configured billing portal supports setting a default and removing a method. Provide the correct portal action and return/refresh flow; if a capability is not supported, show that clearly rather than offering a broken control.

## Storage files — `/auth/en-us/account/storage/files`

- **AUTH-REM-28 — Upload files.** Add a file picker and upload progress to the Files screen; connect existing upload initialization, transfer and completion, enforce the approved file and quota rules, and show success, failure, and retry without creating a duplicate item.
- **AUTH-REM-29 — Download files.** Add a download action to each permitted file, request the existing authorized download endpoint, and handle missing access or unavailable files.
- **AUTH-REM-30 — Move files to trash.** Add a permitted row action with confirmation and pending/error feedback, then refresh the file list, quota, trash, and activity as appropriate.
- **AUTH-REM-31 — Navigate and find files.** Connect folder rows to their contents and add the list pagination needed for larger folders; keep navigation and results scoped to the active organization and current access.
- **AUTH-REM-32 — Manage file access.** Build the approved owner-managed grants interface using the existing grant operations: view, add, and revoke access with role checks and clear outcomes. Follow [storage requirements](./requirements/storage-system.md).
- **AUTH-REM-33 — Protect quota during simultaneous uploads.** Make quota reservation and completion safe when multiple uploads begin near the limit; release reservations on failure or expiry and keep displayed usage consistent.

## Storage trash — `/auth/en-us/account/storage/trash`

- **AUTH-REM-34 — Complete permanent deletion if approved.** Decide whether users may delete before the retention period, who can do it, and what happens to metadata and activity. If approved, add a confirmed, authorized permanent-delete action and its failure recovery.

## Storage activity — `/auth/en-us/account/storage/storage-activity`

- **AUTH-REM-35 — Browse longer storage history.** Add pagination to the storage activity screen and preserve active-organization scope, filters, and useful empty/error feedback.

## AI usage — `/auth/en-us/account/ai-usage`

- **AUTH-REM-36 — Make usage data actionable.** Connect approved metered AI operations to the credit ledger so the overview reflects actual usage; add a retry control when usage cannot load. **Dependency:** the current approved v1 scope does not include AI invoke routes; amend it before building producers.

## AI usage history — `/auth/en-us/account/ai-usage/usage-history`

- **AUTH-REM-37 — Browse complete usage history.** Add cursor-based pagination and connect it to the approved usage ledger, with organization access, empty state, and retry behavior.

## Model usage — `/auth/en-us/account/ai-usage/model-usage`

- **AUTH-REM-38 — Show model usage if approved.** Define the model identifier and usage data captured by approved metered operations, add an organization-scoped summary, and replace the blocked screen with a readable breakdown. See [model usage draft](./requirements/ai-usage-model-breakdown.md).

## AI limits and alerts — `/auth/en-us/account/ai-usage/limits-alerts`

- **AUTH-REM-39 — Manage limits and alerts if approved.** Define who can change settings, thresholds, recipients, delivery, and whether limits block usage. Add persistence, enforcement where approved, and a settings screen with save and error states. See [limits draft](./requirements/ai-usage-limits-alerts.md).

## Help and support — `/auth/en-us/account/help-support` and `/auth/en-us/account/help-support/help-center`

- **AUTH-REM-40 — Provide help and a support contact.** After approving the support model, replace unavailable pages with the approved help content and contact action, localized where needed. Do not assume ticketing is part of v1. See [help draft](./requirements/account-help-support.md) and decision batch E.

## Support tickets — `/auth/en-us/account/help-support/support-tickets`

- **AUTH-REM-41 — Provide ticket management only if approved.** Choose whether this route uses a support provider, a mail contact, or a ticket system. If tickets are approved, provide creation, status, replies, access control, and a safe attachment policy; otherwise align the route and navigation with the chosen support flow.

## Deployment-dependent setup

- **AUTH-REM-42 — Complete external service configuration.** Configure the approved Auth provider credentials, mail delivery, Blob storage, billing provider, webhook secrets, and storage purge schedule for the target environment. Keep missing services visible as unavailable instead of presenting incomplete actions as successful.

## Post-implementation ops (2026-11-15)

After pulling the Phase 9 sweep:

1. **Migrations** — apply `0016_phase9_notifications_privacy` and `0017_org_ai_usage_policy` (`pnpm --filter auth db:migrate`).
2. **Env** — set `SUPPORT_EMAIL` (help support mailto); keep `AUTUMN_SECRET_KEY` / Stripe / Resend / OAuth as needed for billing and sign-in QA.
3. **Verification** — run through unverified flows in the list above (invites, member roles, magic link, org switch under load); code is in tree but browser sign-off is still yours.

## Fixes landed in tree (2026-11-15, partial live review)

These address false “no organization” states, provisioning gaps, and stuck loaders. They do **not** complete AUTH-REM placeholders or file upload UI.

| Area                               | What changed                                                                                                                 | Still blocked without                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Org session (billing, storage, AI) | `useOrgSessionActiveId` fallback, `useOrgSessionActiveIdPending` skeletons, `OrgSessionEffects` auto-activate single org     | User with multiple orgs must still set active org                                                   |
| Received invitations               | List fetch no longer waits on client `sessionPending`                                                                        | Verified email for invitation API                                                                   |
| Storage list/overview              | `repairOrganizationProvisioningRows` on read; `STORAGE_NOT_PROVISIONED` UI + Try again; init upload repair                   | Upload/download row actions (AUTH-REM-28–33)                                                        |
| Billing overview gate              | Session/role pending skeleton; entitlement retry; owner query + gate aligned; Autumn sub-routes use `BillingQueryErrorState` | `AUTUMN_SECRET_KEY` + bound Autumn customer for payment methods, invoices, history, billing details |
| Location permissions               | Skeleton while `readState` loads                                                                                             | Persistent disable = oRPC/session failure                                                           |
| Studio redirect                    | —                                                                                                                            | Studio on `:3003` or env URL                                                                        |
| Google sign-in                     | —                                                                                                                            | OAuth env in `apps/auth/.env`                                                                       |

## Live browser review — 2026-11-15 (continued)

- **Organizations create — `/auth/en-us/organizations/create`:** loaded the multi-step Basics form. Organization name, slug, type radios, tagline, description, logo upload/URL, Save draft, and Next are visible. No draft or organization was saved.
- **Organization invitations — `/auth/en-us/organizations/invitations`:** route loaded with the received-invitations view, but the list was still showing `Loading` during this check. No invitation was accepted or declined.
- **Storage overview — `/auth/en-us/account/storage`:** tabs Overview, Files, Storage Activity, and Trash are visible. The page reports `No organization selected` and links to Organizations; no storage action is available without an active organization.
- **Security permissions — `/auth/en-us/account/security/permissions`:** location collection switch and Delete location history are visible but disabled; browser permission is reported Allowed. No permission or history action was changed.
- **Available plans — `/auth/en-us/account/subscription/available-plans`:** route loads the plan comparison shell but reports `Could not load billing overview. Try again.` and `Billing integration is not configured. Set AUTUMN_SECRET_KEY to enable upgrades.` No upgrade or checkout action was used.
- **AI usage — `/auth/en-us/account/ai-usage`:** route loads the tabs Overview, Model Usage, Usage History, and Limits & Alerts, but reports `This feature is not available yet` and `No organization selected`. No usage action was available.
