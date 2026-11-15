# Requirements: Better Auth

**Status:** v1 implemented (2026-11-05)  
**Approved by:** user (2026-11-05, “ya do it”)

## Goal

**v1:** Auth app with Google, GitHub, magic link (Resend prod; UI in dev), Drizzle + Docker Postgres. **Later:** first-user vs returning redirects, onboarding workflow, orgs/roles, protected areas, **central login for all apps on one domain**.

## Decided

| Item                 | Choice                                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign-in              | Google, GitHub, magic link (show in dev; Resend prod)                                                                                                                      |
| DB                   | `infra/db/postgres/` → Neon later                                                                                                                                          |
| ORM                  | `@packages/drizzle`                                                                                                                                                        |
| Server / UI / app    | `@packages/better-auth` · `@modules/auth` · `apps/auth`                                                                                                                    |
| Orgs & roles         | **Deferred** (no org plugin in v1)                                                                                                                                         |
| Protected `/account` | **Deferred** (login only in v1)                                                                                                                                            |
| Stub routes          | `/{locale}/first-login`, reuse `/{locale}/welcome` (empty; workflow later)                                                                                                 |
| After login (target) | **First user → welcome; returning → home** — implement rules **later**                                                                                                     |
| Multi-app (future)   | Unauthenticated on **any app** → auth app → login → **return to that app with session**. ~3 more apps, **one domain**, path routing (e.g. `/auth`, `/web`), not subdomains |
| Account chrome       | `@modules/shell` unchanged                                                                                                                                                 |

## Layers

`infra/db/postgres/` · `@packages/drizzle` · `@packages/better-auth` · `@modules/auth` · `apps/auth`

## v1 flow (minimal)

Sign-in → session created → redirect behavior **stub/TBD** (no first-user vs home logic required in slice 1)

## Env

Validated only via **`@packages/t3-env`** (T3 Env). **MUST NOT** use `process.env` elsewhere.

| File                                            | Role                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `apps/auth/.env`                                | **Server** secrets and URLs (`DATABASE_URL`, `BETTER_AUTH_*`, OAuth, Resend) |
| `apps/auth/.env.local`                          | **Client** `NEXT_PUBLIC_*` only                                              |
| `apps/auth/.env.example` / `.env.local.example` | Committed templates                                                          |

Imports: `@packages/t3-env/server` · `@packages/t3-env/client`

New packages: folder name = npm name (e.g. `@packages/better-auth`, `@packages/drizzle`, `@packages/resend`).

## Build order (after approval)

0. `@packages/t3-env` (T3 server/client split)
1. Infra Postgres
2. `@packages/drizzle`
3. `@packages/better-auth` (social + magic link, **no org**)
4. App API + env
5. Sign-in UI
6. Stub `welcome` + `first-login` routes

## Open (optional before sign-off)

- [ ] Exact **callback URL** pattern for “return to calling app” (query param? cookie?) — design in multi-app phase
- [ ] **Approved by** filled

**Workflow:** [../../workflow/04-requirements-first.md](../../workflow/04-requirements-first.md)

---

# Requirements: Better Auth v2 — account security and platform authorization

**Status:** Partially implemented; broader product and production sign-off remains open
**Approval:** The user directed implementation of the Auth and Account roadmap. This is not approval of unresolved enterprise or product-policy decisions below.
**Layers:** `@packages/better-auth` · `@packages/drizzle` · `@modules/*` · `apps/auth`

## Goal

Complete the personal-account security surface, make the Auth service usable by
approved external clients and MCP clients, and add a separately protected
administration surface. Organizations, organization roles, teams, and
invitations remain a later initiative.

## In scope

Current checkout evidence: account deletion, revoke-other-sessions, and GitHub sign-in-method controls exist and have isolated API tests. Deletion completion is diagnostic logging, not a retained account-history event. SSO, MCP, device authorization, and administration have foundations described below but are not production-ready. Unchecked items remain incomplete end-to-end, including browser and deployment verification.

- [x] Account deletion with a deliberate confirmation and an audit event. Completion is recorded as diagnostic logging, not a retained unified account-history row (per hooks in `@modules/security`).
- [x] Revoke all sessions except the current session.
- [x] Sign-in-method management for the configured GitHub account.
- [ ] Enterprise SSO using OIDC and SAML for a future customer connection.
- [ ] OAuth-based MCP authorization and protected-resource scopes.
- [ ] OAuth device authorization for approved first-party devices or CLI clients.
- [ ] An internal administration surface for user management.
- [ ] Navigation, command-registry entries, activity records, tests, migration,
  and authenticated browser verification for every approved capability.

## Out of scope

- Organizations, organization roles, teams, invitations, organization-owned
  API keys, and SCIM. These require a separate ownership and authorization
  model.
- Google sign-in and magic-link sign-in until their provider credentials are
  available. API keys, passkeys, two-factor authentication, email/password
  credentials, billing, and data export.
- An unrestricted public OAuth client-registration service or public admin
  access.

## Architecture

| Area                                         | Owner                                                                   | Responsibility                                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Better Auth configuration and client plugins | `@packages/better-auth`                                                 | Enable matching server/client plugins, trusted origins, email callbacks, and typed client methods. |
| Auth tables and migrations                   | `@packages/drizzle`                                                     | Add schema required by approved Better Auth plugins; generate and review SQL migration.            |
| Personal security UI                         | `@modules/security`, `@modules/sessions`, `@modules/connected-accounts` | Account-deletion, session, and sign-in-method flows.                                               |
| SSO, device, MCP, and admin domains          | New standalone modules                                                  | Own authorization, server procedures, UI, audit events, and client hooks.                          |
| Routing, i18n, and composition               | `apps/auth`                                                             | Thin routes, protected layouts, locale messages, registry composition, and runtime configuration.  |

## Feature decisions still required

| Capability              | Required decision before implementation                                                                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account deletion        | Password/fresh-session confirmation only, or an emailed verification link as well? Retention/deletion policy: [account-data-retention-deletion.md](./account-data-retention-deletion.md) (Phase 6 — pending sign-off). |
| Profile optional fields | Better Auth `user` stays auth identity; business profile columns → **`profile_details`** 1:1 table — [profile-optional-fields.md](./profile-optional-fields.md) (**S2** preference, 2026-11-14 batch).                 |
| Revoke all sessions     | Confirm the current session is always preserved; define whether a password change also invokes this action.                                                                                                            |
| Sign-in methods         | GitHub is the only active provider. Confirm whether unlinking its final usable account is blocked.                                                                                                                     |
| SSO                     | Identify initial customer IdP(s), whether SAML is required in the first slice, who may create/edit connections, and domain-verification policy.                                                                        |
| MCP authorization       | Identify MCP resources, exact scopes, consent copy, token lifetime/refresh policy, and the first MCP server endpoint.                                                                                                  |
| Device flow             | Identify approved client IDs, scopes, verification URL, and whether this is only for a first-party CLI.                                                                                                                |
| Admin                   | Identify admin bootstrap source, allowed operations, impersonation policy, audit/approval rules, and admin-route access model.                                                                                         |

## Environment and email

GitHub, Better Auth URL, secret, and database settings remain in
`@packages/t3-env`. Google and Resend remain disabled until credentials are
provided. Add only the credentials and public URLs required by the approved
SSO, OAuth/MCP, or device-authorized clients. Email callbacks are out of scope
for this phase, so account deletion must use the approved non-email
confirmation flow.

## End-to-end flows

1. A signed-in user starts a sensitive account action. The system requires the
   approved re-authentication or email confirmation, executes the action,
   invalidates affected session/query state, and records activity.
2. A user connects or removes GitHub. The system prevents removal of the
   last usable sign-in method if that policy is approved.
3. An enterprise user starts SSO. The selected OIDC/SAML provider is resolved
   under the approved tenant policy and redirects only to an allowlisted URL.
4. An MCP client or approved device requests authorization. The account page
   presents the client, resource, and scopes, then explicitly approves or
   denies it. Tokens are audience- and scope-bound.
5. An authorized administrator performs only the approved user-management
   operation. Every operation is audit-recorded and follows the approved
   impersonation policy.

## Implementation slices after approval

**Progress:** Slices **1–7** implemented at scaffold/foundation level (slice **5** — MCP OAuth, `0010`, consent + `/api/mcp`; DCR off, trusted clients via env). Browser QA, OAuth client bootstrap, CIMD, and v2 sign-off still open. Apply migrations **`0007`–`0010`** per env.

1. Add merge validation and awaited/error-handled command execution, then test
   registry contributions from account modules.
2. Implement sign-in-method inventory and revoke-other-sessions.
3. Implement account deletion with the chosen confirmation and retention policy.
4. Add the SSO plugin, schema, connection management, and sign-in route. _(Foundation implemented 2026-11-10 — pending IdP policy sign-off.)_
5. Add OAuth/MCP authorization, consent, and protected-resource validation.
6. Add device authorization for the approved clients.
7. Add the admin plugin, bootstrap, protected admin routes, and audit controls.

## Slice 4 — SSO foundation (implemented 2026-11-10)

| Area                                                                  | Status                                                            |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `@better-auth/sso` + `ssoClient()`                                    | Wired in `@packages/better-auth`                                  |
| `sso_provider` Drizzle schema + migration `0008_chubby_ben_urich.sql` | Generated                                                         |
| Provider registration                                                 | **Admins only** (`providersLimit`); no `defaultSSO` / vendor IdP  |
| Domain verification                                                   | **Off** until policy approved                                     |
| Admin inventory                                                       | Console `/sso` — read-only table via `admin.sso.connections.list` |
| End-user route                                                        | Auth `/{lang}/sign-in/sso` (`authClient.signIn.sso`)              |
| Connection create/update UI                                           | **Not built** — use Better Auth SSO API after decisions           |

### Open SSO decisions (blockers for full rollout)

| Decision                                                           | Impact                                                     |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| Initial customer IdP(s) and protocol order (SAML vs OIDC first)    | Registration forms, test plan, redirect URLs               |
| Who may create/edit connections (platform admin only vs delegated) | oRPC mutations + guard policies                            |
| Domain-verification policy (`domainVerification.enabled`)          | DNS/token flow, sign-in gating                             |
| Implicit sign-up / account linking rules                           | `disableImplicitSignUp`, `resolveUser`, `trustedProviders` |
| SAML SP keys, ACS URLs, and certificate rotation                   | Env + ops runbooks                                         |

## Slice 6 — device authorization (scaffold 2026-11-10)

| Area                                                            | Status                                                                                                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Better Auth `deviceAuthorization` + `deviceAuthorizationClient` | Wired in `@packages/better-auth`                                                                                                                        |
| Client allowlist                                                | `BETTER_AUTH_DEVICE_CLIENT_IDS` — **deny all** when unset                                                                                               |
| Verification URL                                                | Defaults to `{BETTER_AUTH_URL}/device`; override via `BETTER_AUTH_DEVICE_VERIFICATION_URL`                                                              |
| `device_code` table                                             | Migration `0009_device_authorization.sql`                                                                                                               |
| Account UI                                                      | `modules/device-authorization` → `/account/security/device-authorization`                                                                               |
| CLI landing                                                     | `/{lang}/device?user_code=` (auth route group; requires session)                                                                                        |
| Activity action ids                                             | `security.device_authorization.approve` / `.deny` registered                                                                                            |
| Policy + API tests                                              | `tests/device-authorization-policy.test.tsx`, `tests/device-authorization-isolated-db.test.tsx`, `tests/device-authorization-user-code-schema.test.tsx` |

## Slice 7 — platform admin (implemented 2026-11-10)

| Area                                             | Status                                                                                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Better Auth `admin` + custom AC (no impersonate) | `@packages/better-auth`                                                                                                                      |
| Bootstrap                                        | Verified emails in `CONSOLE_ADMIN_EMAILS` → `admin` role via DB hooks                                                                        |
| Schema                                           | `user.role` / ban fields, `session.impersonated_by`; migration `0007_harsh_fabian_cortez.sql`                                                |
| Domain module                                    | `@modules/admin` — `adminProcedure`, `admin.users.list`, activity `admin.users.list`                                                         |
| Console routes                                   | `requireConsoleAccess` + `/{lang}/users` (redirect to Auth `/{lang}/unauthorized?reason=console_access_denied` when signed in but not admin) |
| Tests                                            | `tests/admin-authorization.test.tsx`                                                                                                         |

### Open admin decisions (blockers for full user management)

| Decision                                        | Impact                                                 |
| ----------------------------------------------- | ------------------------------------------------------ |
| Impersonation policy                            | Re-enable `impersonate` in admin AC + audit action ids |
| Allowed mutations (ban, delete, set-role scope) | Additional oRPC procedures + UI                        |
| Multi-admin approval for destructive ops        | Workflow + activity schema                             |
| Browser verification suite                      | Validation checklist                                   |

### Open device-flow decisions (blockers for production CLI)

| Decision                                           | Impact                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Approved `client_id` values for first-party CLI(s) | `BETTER_AUTH_DEVICE_CLIENT_IDS`                                                                  |
| Allowed scopes and consent copy                    | `BETTER_AUTH_DEVICE_SCOPES` + UI; scope allowlist enforced on `/device/code` when the env is set |
| Canonical verification URL vs account-only path    | `BETTER_AUTH_DEVICE_VERIFICATION_URL`                                                            |
| Server-side activity on approve/deny               | oRPC or database hooks                                                                           |
| Browser/API verification suite                     | Validation checklist                                                                             |

## Validation checklist before completion

- [ ] Every migration is generated, reviewed, and applied to the intended environment.
- [ ] GitHub, session revocation, and account-deletion flows have authenticated browser coverage.
- [ ] SSO, MCP consent, and device approval/rejection have browser and API coverage.
- [ ] Admin authorization is denied to ordinary users and every permitted admin action is audited.
- [ ] Token, redirect, scope, origin, and cross-user authorization tests pass.
- [ ] `pnpm check` passes.
- [ ] User sign-off is recorded before implementation starts.
