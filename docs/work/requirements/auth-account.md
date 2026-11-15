# Requirements: Auth account

**Status:** Implemented — authenticated browser flows partially verified  
**Approved by:** User, 2026-11-07  
**Layers:** packages / modules / apps

## Goal

Build a real account experience in the Auth app using the existing Better Auth session, shared UI and account shell. Replace placeholder content only where the corresponding capability is implemented.

## Proposed first scope

- [x] Account overview: show the signed-in user's actual account information and links to profile and security.
- [x] Profile: show the current name and email; allow updating the display name with validation, pending feedback, and error handling.
- [x] Security sessions: show the user's own sessions and allow revoking other sessions, with confirmation and feedback.
- [x] Connected accounts: show the user's connected sign-in providers. Provider linking and unlinking require a separate decision.
- [x] Keep the existing account navigation, accordion presentation, locale handling, authentication guard, and page spacing.
- [x] Remove empty billing, subscriptions, storage, usage, support, data control, and settings routes and navigation until their domain capabilities are implemented (user request, 2026-11-07).

## Out of scope for this proposal

Email changes, password management, passkeys, account deletion, provider linking/unlinking, organization roles, billing and other non-identity product features. They require separate requirements and any needed provider configuration.

## Architecture

| Layer                                 | Proposed responsibility                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `@packages/better-auth`               | Existing Better Auth server/client integration; expose supported operations through its public API. |
| `modules/auth`                        | Auth-specific account overview and shared identity logic, with `auth.`-prefixed files.              |
| `modules/profile`, `modules/security` | Profile and security domain screens, per existing module boundaries.                                |
| `@features/*`, `@packages/ui`         | Existing form, accordion, toast, skeleton and shell primitives.                                     |
| `apps/auth`                           | Thin route wiring, route-level session guard and localization configuration.                        |

## End-to-end flow

1. A signed-in user opens `/account`, `/account/profile`, `/account/security/sessions`, or `/account/security/connected-accounts` in the current locale.
2. The existing server session guard redirects signed-out users to sign-in.
3. Account data comes from the authenticated user's Better Auth session or supported session/account operations. Never accept a user ID from the browser as authority.
4. Profile changes and session revocation show pending, success, and failure states. Revocation must not allow one user to affect another user's session.

## Environment and data

Use the existing `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_AUTH_APP_URL` configuration. No new provider, environment variable, schema change, or migration is planned; verify Better Auth's supported operations and existing schema before implementation. Existing records must be preserved.

## Open decisions

- [x] Implement the proposed functional first scope.
- [x] Exclude the current session from revocation; sign out remains in the header.
- [x] Connected provider information is read-only.

## Proposed implementation slices

1. Confirm supported Better Auth operations and session ownership; implement the account overview.
2. Implement profile reading and display-name updates.
3. Implement session listing and revocation, then read-only connected providers.
4. Move relevant route UI into its owning module and keep app routes thin. Retain the existing shell and protect each route.
5. After each slice run `pnpm check`; verify the authenticated browser flows, loading and error states, locale/base-path routing, and authorization between users.

## Validation before approval

- [ ] Scope and route list confirmed.
- [ ] Session revocation and provider-linking decisions confirmed.
- [ ] Existing database and authentication configuration confirmed; any required migration or new provider explicitly approved.
- [x] User approved the requirements document before implementation.

## Verification performed

- `pnpm check` and isolated TypeScript checks for the auth, profile, and security modules passed.
- The Auth production build passed with an isolated test database.
- On the isolated database, two test users verified profile update isolation, session listing isolation, cross-user revocation denial, and revocation of another session while preserving the current one. The account, profile, sessions, and connected-account routes returned HTTP 200 with a test session.
- Unauthenticated list, update, and revoke calls returned 401.
- In an isolated browser and test database, signed in by magic link, verified required-name validation, saved a profile name and confirmed it persisted after reload, expanded the email section, and opened the current session and connected accounts pages. Session revocation and comprehensive accessibility and visual checks were not tested in the browser.

- Browser session revocation was verified using a disposable session in the test database: the confirmation identified the test device, sign-out removed it from the list and database, and the current browser session remained active.
