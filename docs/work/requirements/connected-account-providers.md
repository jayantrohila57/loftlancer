# Requirements: Connected account providers

**Status:** Approved — 2026-11-07  
**Layers:** packages / modules / apps

## Goal

Let signed-in users review their existing sign-in methods and explicitly connect or disconnect the social providers already supported by this project.

## Scope

- Show GitHub and Google with clear connected, available, or not-configured status. Only enable connection when server-side provider credentials are configured; never expose credentials to the browser. GitHub is configured in the current local Auth environment; Google credentials are not currently present.
- Let signed-in users connect an available social provider through Better Auth's OAuth linking flow, returning to the connected-accounts page and showing success or actionable failure feedback.
- Let signed-in users disconnect a connected provider after confirmation, with pending and error feedback. Respect Better Auth's server-side protection against unlinking the last account; do not infer that an email magic-link identity is a linked OAuth account.
- Show email magic link as a separate sign-in method for the account email, rather than presenting it as a connectable OAuth provider. No email changes or new sign-in providers are included.
- Handle loading, empty, unavailable, callback failure, and multiple-account cases. Enforce session and account ownership on the server. Avoid displaying tokens or private provider identifiers.
- Use the existing account accordion, UI primitives, app base path and locale navigation. Test safe cases using disposable accounts and provider test credentials; do not disconnect a real user's provider.

## Architecture and constraints

The Better Auth integration exposes supported provider configuration and uses its built-in `linkSocial`, `listAccounts`, and `unlinkAccount` operations. The Auth app exposes only the enabled-provider status needed by the client. Keep credentials and linking policy on the server, preserve verified-email matching defaults, and retain the last-account safeguard. **`/list-accounts` responses are stripped** by `buildPublicListAccountsPlugin` (`@packages/better-auth`) to `id`, `providerId`, and `createdAt`; the Account UI lists linked methods via oRPC (`serializeLinkedConnectedAccounts`). No database schema changes are expected; check installed Better Auth behavior before implementation.

## Verification

Run `pnpm check` and relevant module typechecks. Browser-check configured and unconfigured provider states, cancellation, and errors. A real OAuth link/unlink test requires disposable provider accounts and valid credentials; report any unavailable provider tests clearly.

## Verification performed

- Browser-checked GitHub connected, Google unconfigured, and the disconnect confirmation and cancellation states.
- Created a synthetic Google account record in the test database and disconnected it in the browser. The record was removed and the existing GitHub account remained connected.
- Verified an unauthenticated request to provider availability returns 401 and an OAuth error callback displays feedback.
- A real OAuth linking round trip was not performed: a disposable provider account is not available, and Google credentials are not configured locally.
- 2026-11-13 P0 destructive pass: disposable **non-OAuth** unlink verified via live Auth API on a DB-provisioned user with synthetic GitHub + Google (Google unlinked, GitHub retained). Browser unlink UI and GitHub OAuth link/unlink remain blocked without a disposable GitHub identity and a way to inject an httpOnly session into automated browser tools.
- **Accepted without a second GitHub identity:** synthetic provider rows plus server `unlinkAccount` / UI unlink for non-last providers satisfy product verification; fake OAuth credentials are not used. A **second disposable GitHub account** is optional and only needed for a full GitHub OAuth link/unlink QA pass in the browser.
- 2026-11-14: loading skeleton, empty/unconfigured provider rows, multi-GitHub labels, load-error retry, and `sessionEnded` covered by `tests/connected-accounts-sign-in-states.test.tsx` and `tests/connected-accounts-unlink-states.test.tsx` (roadmap Phase 3 checkbox).
- **2026-11-14 (task 12/20):** Last-method UI guard aligned with Better Auth (`accounts.length === 1`, not GitHub-specific) via `connected-accounts.unlink-guard`; legacy off-inventory linked rows expose disconnect with the same guard. Tests: `tests/connected-accounts-unlink-guard.test.tsx` plus extended sign-in/unlink state tests. Server link/unlink policy remains in `auth-security-isolated-db.test.tsx`.
- **2026-11-14 (task 53/60):** Renamed guard helpers to sign-in terminology; documented Better Auth parity (all linked account rows, email magic link not inferred as OAuth). UI + unit coverage for sole Google and legacy Google rows; isolated-db refuses unlink for Google-only disposable user. Better Auth built-in last-account denial unchanged.
- **2026-11-14 batch — pending:** Full **GitHub OAuth link/unlink** live browser round trip **deferred to go-live** (second disposable GitHub identity or production cutover checklist). Roadmap Phase 3 **optional** item stays **unchecked**; not blocking other Phase 3 work.
