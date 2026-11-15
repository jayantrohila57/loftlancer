# Phase 8 — oRPC / OpenAPI / compatibility caller audit

**Status:** Inventory complete (2026-11-14)  
**Roadmap:** [auth-account-roadmap.md](./auth-account-roadmap.md) Phase 8  
**Normative API overview:** [docs/modules/api-structure.md](../modules/api-structure.md)  
**Policy:** No breaking contract changes without explicit user approval.

## Summary

| Transport                                                              | Role                                                       | In-repo production callers                                                                                          |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Typed oRPC (`/auth/api/rpc` via `securityRpc`)                         | Primary client path on **Auth app origin** account modules | Activity (unified), location, sessions list, connected accounts, regional/appearance forms, account format provider |
| OpenAPI HTTP (`POST /auth/api/openapi/security/…`)                     | Same procedures as RPC; Scalar + integrators               | No dedicated production client — procedures are exercised in focused API/DB tests                                   |
| Compatibility HTTP (`/auth/api/account/…`, `/auth/api/profile/avatar`) | Legacy/stable HTTP shapes during migration                 | Location capture helper, cross-app appearance read; several routes have **no** in-repo app callers (tests only)     |
| Better Auth (`/auth/api/auth/…`, `authClient.*`)                       | Auth protocol + account primitives                         | Profile, sign-in/out, link/unlink, session revoke, account delete                                                   |
| Server-only services (no HTTP from Console UI)                         | Admin users + SSO connection list                          | Console RSC pages call `adminService` / `ssoService` directly (OpenAPI mirrors behavior for Auth reference)         |

**Headline gaps (no breaking action without approval):**

1. **Legacy activity** — `security.activity.list` / `.delete` and `GET`/`DELETE` `/auth/api/account/activity` remain implemented and OpenAPI-documented, but **no Auth route** mounts `SecurityActivityScreen`; production UI uses **unified** `feed` / `detail` / `clear` only. Legacy stack is orphan UI + compatibility surface ([activity-deeplinks-legacy-retirement.md](./requirements/activity-deeplinks-legacy-retirement.md) L1).
2. **`useProviders` / `security.providers.list`** — Hook exported; **no component** calls it. Connected-accounts UI uses `signInMethods.inventory` + Better Auth linking instead.
3. **`GET /auth/api/account/providers`** — Better Auth provider **availability** (not oRPC `providers.list`). **Tests only** in repo; sign-in entry uses `/auth/api/sign-in/social-providers`.
4. **Cross-app RPC** — `securityRpc` targets `window.location.origin` + `/auth/api/rpc`. Console/Studio/Web do **not** import account oRPC hooks; only **GET** `/auth/api/account/appearance` (trusted origins) and Better Auth session cookies apply cross-app.

## OpenAPI procedure inventory (19 paths)

Mounted under `/auth/api` with server prefix `/auth/api` → spec paths `/openapi/security/…` and `/openapi/admin/…`.

| Procedure          | OpenAPI path                                     | RPC name                                        |
| ------------------ | ------------------------------------------------ | ----------------------------------------------- |
| Activity (unified) | `…/activity/feed`, `detail`, `clear`             | `security.activity.feed`, `.detail`, `.clear`   |
| Activity (legacy)  | `…/activity/list`, `delete`                      | `security.activity.list`, `.delete`             |
| Appearance         | `…/appearance-preferences/get`, `update`         | `security.appearancePreferences.get`, `.update` |
| Regional           | `…/regional-preferences/get`, `update`           | `security.regionalPreferences.get`, `.update`   |
| Location           | `…/location/get`, `preference`, `save`, `delete` | `security.location.*`                           |
| Sessions           | `…/sessions/list`                                | `security.sessions.list`                        |
| Connected accounts | `…/providers/list`                               | `security.providers.list`                       |
| Sign-in methods    | `…/sign-in-methods/accounts`, `inventory`        | `security.signInMethods.accounts`, `.inventory` |
| Admin              | `/openapi/admin/users/list`                      | `security.admin.users.list`                     |
| SSO                | `/openapi/admin/sso/connections/list`            | `security.sso.connections.list`                 |

Shared procedure rules (see api-structure.md): `ServiceResponse` envelope (`success` | `failed` | `error`); session user from server; mutations require same-origin on OpenAPI transport; private responses `no-store`.

## Compatibility HTTP inventory

| Route                          | Methods           | Server entry                                                         | In-repo callers                                                                                                                                                                           |
| ------------------------------ | ----------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/auth/api/account/activity`   | GET, DELETE       | `getAccountActivityResponse`, `deleteAccountActivityHistoryResponse` | **None** (app). `tests/activity-compatibility-errors.test.tsx`, isolated DB suites                                                                                                        |
| `/auth/api/account/sessions`   | GET               | `getAccountSessionsResponse`                                         | **None** (app). Compat + isolated DB tests                                                                                                                                                |
| `/auth/api/account/location`   | GET, POST, DELETE | Location transport modules                                           | **`capturePermittedLocation`** (`@modules/auth`) when `NEXT_PUBLIC_AUTH_APP_URL` matches **current origin**; sign-out (`authSessionApi`), sessions screen, location settings use **oRPC** |
| `/auth/api/account/appearance` | GET               | `readAppearancePreferencesHttp`                                      | **`AppearancePreferencesEffects`** in Auth, Studio, Console layouts (cross-origin credentialed read)                                                                                      |
| `/auth/api/account/providers`  | GET               | Better Auth `readSocialProviderAvailability`                         | **Tests only**                                                                                                                                                                            |
| `/auth/api/profile/avatar`     | POST              | `uploadProfileAvatar`                                                | **`api.profile.useUploadAvatar`** (`fetch` multipart)                                                                                                                                     |

Not in OpenAPI spec: Better Auth `/auth/api/auth/*`, health, MCP, sign-in social-providers, reference UI.

## Caller matrix by domain

### Unified activity (current product UI)

| Consumer                                                                          | Transport | Contract                                                        |
| --------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------- |
| `UnifiedActivityFeed`, `ActivityDestination`, overview/login/user activity routes | oRPC      | `feed` query / `detail` / `clear` payloads per api-structure.md |
| `SecurityActivityDataManagement`                                                  | oRPC      | `activity.clear` `{ scope: "all" }` only                        |

Routes: `apps/auth/.../account/activity/*`, `.../security/activity`, `.../user-activity`, data-management pages.

### Legacy activity (retirement candidate)

| Consumer                 | Transport         | Contract                                                                                            |
| ------------------------ | ----------------- | --------------------------------------------------------------------------------------------------- |
| `SecurityActivityScreen` | oRPC list/delete  | Paginated `{ query: { kind, page, type?, since? } }`, delete `{ payload: { kind } }`                |
| —                        | Compat GET/DELETE | Querystring kind/page; DELETE by kind; strips fields per kind (see `activity.activity.list.api.ts`) |

**Production routes:** none for `SecurityActivityScreen` (component + tests only).

### Appearance preferences

| Consumer               | Transport       | Contract                                             |
| ---------------------- | --------------- | ---------------------------------------------------- |
| Form + overview (Auth) | oRPC get/update | Standard envelope + `payload` partial update         |
| Cross-app effects      | Compat GET only | JSON envelope; CORS for trusted origins; 401/403/503 |

### Regional preferences

| Consumer                                    | Transport       | Contract                                |
| ------------------------------------------- | --------------- | --------------------------------------- |
| Form, overview, `AuthAccountFormatProvider` | oRPC get/update | Partial `payload`; ISO-validated fields |

No compatibility HTTP route.

### Location

| Consumer                                | Transport                          | Contract                                |
| --------------------------------------- | ---------------------------------- | --------------------------------------- |
| Location settings UI (`useLocationApi`) | oRPC get, preference, save, delete | Generation-gated save; `LOCATION_STALE` |
| `capturePermittedLocation`              | Compat GET → POST                  | Same generation rules; HTTP 409 stale   |

### Sessions

| Consumer                 | Transport                                                      | Contract                     |
| ------------------------ | -------------------------------------------------------------- | ---------------------------- |
| `useSessionsApi.useList` | oRPC `sessions.list`                                           | Sensitive tokens in `data`   |
| `useRevoke*`             | Better Auth `authClient.revokeSession` / `revokeOtherSessions` | Not oRPC                     |
| —                        | Compat GET                                                     | Same list controller as oRPC |

### Connected accounts

| Consumer                          | Transport                      | Contract                                                   |
| --------------------------------- | ------------------------------ | ---------------------------------------------------------- |
| `useConnectedAccountsApi.useList` | oRPC `signInMethods.accounts`  | Stripped linked accounts (`id`, `providerId`, `createdAt`) |
| `useInventory`                    | oRPC `signInMethods.inventory` | Enabled/config state for UI                                |
| `useLink` / `useUnlink`           | Better Auth                    | `linkSocial` / `unlinkAccount`                             |
| `useProviders`                    | oRPC `providers.list`          | **Unused** in UI                                           |

### Profile

| Consumer           | Transport                | Contract                                             |
| ------------------ | ------------------------ | ---------------------------------------------------- |
| `useUpdateProfile` | Better Auth `updateUser` | —                                                    |
| `useUploadAvatar`  | HTTP POST avatar         | Multipart; pre-parse limits in compatibility handler |

### Account deletion

| Consumer                        | Transport                | Contract |
| ------------------------------- | ------------------------ | -------- |
| `useSecurityAccountDeletionApi` | Better Auth `deleteUser` | —        |

### Admin / SSO (Console)

| Consumer                      | Transport                                         | Contract                                                                                   |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Console `users` / `sso` pages | **Direct** `adminService` / `ssoService` (server) | Same authZ as oRPC procedures; activity recorded with `admin.*` / `admin.sso.*` action IDs |
| OpenAPI / Scalar              | Callable POST on Auth app                         | For operators signed into Auth — not used by Console client bundle                         |

## Automated contract coverage (reference)

| Area                                          | Tests                                                                                                                                                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unified activity OpenAPI + DB                 | `tests/activity-api-db.test.tsx`, `tests/activity-phase7-access-db.test.tsx`                                                                                                                          |
| Legacy activity compat errors                 | `tests/activity-compatibility-errors.test.tsx`                                                                                                                                                        |
| Location oRPC + compat DB                     | `tests/location-api.test.tsx`, `tests/location-isolated-db.test.tsx`, `tests/auth-permitted-location.test.tsx`, `tests/location-permissions-states.test.tsx`, `tests/location-delete-compat.test.tsx` |
| Sessions compat                               | `tests/sessions-compatibility-errors.test.tsx`, `tests/sessions-compatibility-isolated-db.test.tsx`                                                                                                   |
| Regional / appearance oRPC                    | `tests/regional-preferences-api.test.tsx`, `tests/appearance-preferences-api.test.tsx`                                                                                                                |
| Cross-app appearance GET                      | `tests/appearance-preferences-read-http.test.tsx`                                                                                                                                                     |
| Connected accounts oRPC + list-accounts strip | `tests/connected-accounts-list-api.test.tsx` (accounts, inventory, providers), `tests/connected-accounts-ui-secrets.test.tsx`, `tests/better-auth-list-accounts-public.test.tsx`                      |
| Multi-domain isolated                         | `tests/auth-security-isolated-db.test.tsx`                                                                                                                                                            |

## External / unknown consumers

Documented policy: keep compatibility routes until inventory + verification ([auth-api-migration.md](./requirements/auth-api-migration.md)).

| Surface                                 | Risk if removed without approval         |
| --------------------------------------- | ---------------------------------------- |
| `GET/DELETE /auth/api/account/activity` | Unknown external scripts or integrations |
| `GET /auth/api/account/sessions`        | Same                                     |
| `GET /auth/api/account/providers`       | Low (in-repo unused)                     |
| Legacy oRPC `activity.list` / `.delete` | Low for UI; spec still advertises paths  |

**Recommendation (non-breaking):** Before L1 legacy retirement, confirm deploy access logs or explicit user sign-off that no external caller uses compat activity/sessions routes. No code removal in this audit.

## Doc cross-links updated

- [auth-api-migration.md](./requirements/auth-api-migration.md) — caller inventory section
- [activity-deeplinks-legacy-retirement.md](./requirements/activity-deeplinks-legacy-retirement.md) — L1a caller audit satisfied by this doc (in-repo)

## Open Phase 8 follow-ups (unchanged scope)

- Browser QA of Scalar paths vs live RPC (not run in this audit).
- Error-class matrix (unauthenticated, origin, ownership, outage) — separate checklist item on roadmap.
- Any **contract** change (drop legacy procedures, remove compat routes, merge appearance read onto oRPC cross-app) requires user approval and requirements update.
