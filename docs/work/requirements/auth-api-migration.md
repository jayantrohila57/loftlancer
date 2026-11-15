# Requirements: Auth API and client hook migration

**Status:** Implementing  
**Approved by:** user (2026-11-08, “confirm”)  
**Layers:** packages / modules / apps

## Goal

Migrate the Auth app's existing client data operations to module-owned, chained React hooks and move application-owned server operations to typed oRPC procedures. Preserve the current authentication and account experience.

## In scope

- [x] Provide module-owned hook groups composed into a client API such as `api.security.useSessions()`; hooks may use Better Auth, oRPC, or another API as appropriate.
- [x] Wire the existing React Query provider and typed oRPC client into the Auth app, with request-scoped server behavior and browser cache isolation across identity changes.
- [x] Keep Better Auth's handler, client, session cookies, social and magic-link sign-in, account linking, session revocation, and profile update behavior. Wrap existing operations in module hooks where appropriate; retain `useSession` for the current session unless a change is needed.
- [x] Inventory and migrate the Auth app's existing account sessions, activity, location preferences and history, provider availability, and profile avatar operations. Prefer Better Auth APIs where they provide equivalent behavior; implement application-owned procedures in the corresponding module.
- [x] Move avatar business logic out of the app route, preserving origin, authentication, request-size, image-signature, MIME, and storage checks. Establish request limits before multipart parsing and verify deployment limits before choosing its transport.
- [x] Protect procedures using Better Auth session context and module authorization. Do not trust user IDs from clients. Preserve no-store behavior for private data, cookie/header propagation, and existing response and error semantics where relied upon.
- [x] Keep existing HTTP endpoints available during migration; remove or redirect only after callers and external dependencies have been inventoried and compatibility has been verified.
- [ ] Maintain loading, empty, error, retry, invalidation, sign-in redirects, and account workflows.
- [ ] Update module and API documentation and verify each implementation slice with `pnpm check` and focused tests; perform applicable Auth browser and route checks.

## Out of scope

- Replacing Better Auth or its authentication protocol, changing providers or roles, new auth methods, or changing existing security policy.
- Migrating unrelated applications or changing health endpoints.
- New databases, environment variables, or schema migrations unless separately documented and approved.

## Architecture

| Layer    | Responsibility                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------- |
| Packages | Shared oRPC and React Query infrastructure; Better Auth SDK integration.                            |
| Modules  | Auth, security, and profile hooks; application procedures, validation, authorization, and services. |
| Auth app | Compose hook groups and routers, mount providers, and expose thin HTTP handlers.                    |

## End-to-end flow

1. User signs in through the existing Better Auth flow and receives a session cookie.
2. Auth screens call module hooks under a consistent `api.<module>.use<Operation>` chain.
3. Each hook uses React Query and the appropriate client; current-session state may use Better Auth's own hook.
4. Application oRPC procedures validate requests, obtain the session through Better Auth, enforce authorization, and call module services.
5. Mutations refresh relevant cached data; signing out or switching accounts clears or partitions sensitive client cache.

## Environment

Use the existing Auth URL, database, Better Auth, OAuth, Resend, and Blob configuration. No additional environment variables are planned.

## Plugins / integrations

Existing Better Auth and configured providers, Drizzle database, Blob storage, oRPC, and React Query. No additional provider plugins are planned.

## Roles & authorization

Keep existing access and role policies. Require a validated Better Auth session for protected account operations and scope private records to its user. Preserve existing origin and abuse controls on mutations and uploads.

## Implementation slices

1. Audit current callers and contracts; establish client and server wiring, session context, cache lifecycle, and hook composition.
2. Migrate Better Auth-backed sign-in, session, account-linking, and profile actions to module hooks without changing Better Auth endpoints.
3. Migrate application-owned account sessions, activity, location, and providers in small domain slices, retaining compatible endpoints.
4. Migrate avatar upload with transport and security verification.
5. Complete documentation and run `pnpm check`, targeted tests, relevant app build, and browser verification of sign-in and affected account screens where environment credentials allow.

## Caller inventory (Phase 8 audit, 2026-11-14)

Full matrix: [orpc-openapi-caller-audit.md](../orpc-openapi-caller-audit.md).

- Typed oRPC via `securityRpc` is the primary path for Auth-app account modules; OpenAPI HTTP mirrors the same procedures for Scalar/tests.
- Compatibility HTTP remains for location capture (non-React), cross-app appearance **read**, and legacy activity/sessions shapes with **no in-repo app callers** (tests only).
- Better Auth retains profile update, link/unlink, revoke, delete-user, and avatar multipart upload.
- Legacy `activity.list` / `activity.delete` and `SecurityActivityScreen` are not mounted on any Auth route; unified `feed` / `detail` / `clear` own production UI.

External consumers of compat routes are **not** verified in this repo; do not remove compat endpoints without user approval.

## Progress (2026-11-08)

- Auth, Security, and Profile expose module-owned query and mutation hooks. Better Auth retains its own endpoints and current-session hook. The best-effort location capture helper remains a non-React caller of the compatible HTTP endpoint because it is also used during sign-out.
- Application-owned sessions, activity, providers, and location operations use authenticated oRPC procedures; compatibility HTTP endpoints remain available. Session listing uses the existing repository because Better Auth's built-in listing requires a fresh session, unlike the original endpoint.
- Avatar uploads remain on the dedicated multipart HTTP endpoint to preserve the pre-parse request checks and image signature validation. The Profile module owns the handler and the Blob SDK lives in `@packages/blob`. Vercel Functions have a 4.5 MB request-body limit, below the existing 5 MB UI limit; direct upload with equivalent server-side image verification is future work.
- `pnpm check`, standalone module typechecks, and the Auth production build passed. Authenticated browser reads covered permissions, profile, connected accounts, activity, and sessions. Anonymous RPC and upload rejection checks passed. Destructive mutations, cross-user isolation, provider redirects, and a successful Blob upload remain unverified.

## Hook verification (2026-11-08)

- Sign-out now uses a module mutation and clears the query cache after success. The shared account menu provides a query client in apps that do not otherwise mount one.
- Location reads no longer use a mutation. The current Better Auth session remains on `useSession`; best-effort non-React location capture retains the compatible HTTP API.
- `pnpm test` covers 13 hook behaviors, including user-scoped cache keys, identity changes, success and failure for revocation and sign-out, account and activity invalidation, location updates, profile refresh and upload, and sign-in client errors. External provider and actual Blob calls are mocked; destructive and cross-user server integration flows remain outstanding.

## Validation checklist

- [x] Existing integrations and environment identified; no new variables proposed.
- [x] User flows, current HTTP compatibility, authorization, and upload limits identified.
- [x] No new database or role policy proposed.
- [x] Verify individual endpoint contracts and existing callers before migration. **2026-11-14:** [orpc-openapi-caller-audit.md](../orpc-openapi-caller-audit.md); deploy access logs for compat HTTP still optional.
- [x] User confirmed sign-off.
