# Requirements: oRPC account sessions

**Status:** Draft — awaiting sign-off  
**Approved by:** Pending  
**Layers:** packages / modules / apps

## Goal

Prove the oRPC and React Query foundation with the existing account sessions screen in the Auth app.

## In scope

- [ ] Add a typed account sessions query owned by `modules/security`, reusing the existing sessions repository.
- [ ] Authenticate the request with the existing Better Auth session and restrict results to that user.
- [ ] Add a thin Auth app RPC route and connect the sessions screen to the query using React Query.
- [ ] Preserve the current sessions endpoint while the new flow is verified.
- [ ] Keep session revocation through Better Auth and refresh the query after a successful revocation.
- [ ] Cover unauthenticated and unavailable-database responses, loading, retry, and session isolation.
- [ ] Document the adopted RPC and query conventions and run `pnpm check` plus focused verification.

## Out of scope

- Migrating other account endpoints or the avatar upload.
- Replacing Better Auth's handler or changing sign-in and session behavior.
- New databases, environment variables, roles, or migrations.

## Architecture

| Layer    | Responsibility                                                                        |
| -------- | ------------------------------------------------------------------------------------- |
| Packages | Existing oRPC and React Query infrastructure.                                         |
| Modules  | Security owns the query, authorization, sessions data access, and screen integration. |
| Auth app | Thin RPC route and provider wiring.                                                   |

## End-to-end flow

1. A signed-in user opens account sessions.
2. The screen requests sessions through the typed RPC query.
3. Better Auth validates the request session; the security module returns only that user's active sessions.
4. A successful Better Auth session revocation refreshes the sessions query.
5. The screen shows loading, error, retry, and empty states as appropriate.

## Environment

No new variables. The existing Auth and database configuration remains in use.

## Plugins / integrations

Existing Better Auth and database integrations; no additional plugins are planned.

## Roles & authorization

A valid Better Auth session is required. The session user ID determines the database query; no new roles are introduced.

## Gaps / open questions

- [ ] Confirm this first slice and its compatibility scope before implementation.

## Implementation slices

1. Add the authenticated procedure and thin route; verify request behavior.
2. Connect React Query to the sessions screen and verify revocation refresh.
3. Update API documentation and run the repository checks and focused verification.

## Validation checklist

- [x] Environment and integration impact listed.
- [x] Routes, UI flow, authorization, and compatibility scope named.
- [x] No database migration or new roles required.
- [ ] User confirmed sign-off.
