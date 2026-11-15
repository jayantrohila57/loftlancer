# Requirements: oRPC OpenAPI documentation

**Status:** Done
**Approved by:** user (2026-11-08, “create it”)
**Layers:** packages / modules / apps

## Goal

Provide accurate, interactive OpenAPI documentation for the existing Auth application oRPC procedures, generated from their actual schemas and routes.

## In scope

- [x] Add compatible oRPC v1 OpenAPI and Zod schema-conversion support to the existing `@packages/orpc` boundary.
- [x] Define explicit method, path, input, output, error, summary, and tag metadata for the existing Security procedures. Verify that documented outputs match runtime behavior and do not expose additional session data.
- [x] Mount an oRPC OpenAPI HTTP handler alongside the existing RPC handler so the specification describes real callable HTTP endpoints; retain the current RPC and compatibility routes.
- [x] Provide generated OpenAPI JSON and an interactive Scalar reference UI using the oRPC v1 reference integration.
- [x] Reuse Better Auth session validation, same-origin protection for mutations, no-store headers for private responses, and session-cookie propagation. The documentation and specification require an authenticated session by default; document that choice and make it configurable only if requested later.
- [x] Scope OpenAPI to the oRPC Security router. Explain that Better Auth's own routes and legacy HTTP endpoints are separate and are not automatically part of the oRPC spec.
- [x] Keep domain schemas and route metadata in modules, shared vendor integration in packages, and app route handlers thin. Do not introduce a second implementation of domain logic.
- [x] Document URLs, authentication, local usage, and how to add future procedures.
- [x] Verify generated OpenAPI paths and schemas, authenticated and unauthenticated access, mutation origin enforcement, existing RPC compatibility, `pnpm test`, `pnpm check`, and the Auth production build.

## Out of scope

- Replacing Better Auth's HTTP routes or documenting them as if they were oRPC procedures.
- Publicly exposing documentation by default, changing roles, or adding API keys, OAuth providers, database migrations, or new environment variables.
- Migrating or removing existing compatibility endpoints.

## Architecture

| Layer    | Responsibility                                                                             |
| -------- | ------------------------------------------------------------------------------------------ |
| Packages | oRPC OpenAPI handler, specification generation, Zod conversion, and reference integration. |
| Modules  | Security procedure routes, schemas, metadata, authorization, and domain behavior.          |
| Auth app | Thin HTTP routes for the OpenAPI handler, JSON spec, and reference UI.                     |

## End-to-end flow

1. A signed-in user opens the Auth app's API reference.
2. Scalar reads an authenticated, generated OpenAPI specification describing the oRPC HTTP endpoints.
3. A documented request reaches the OpenAPI handler; Better Auth validates the session and the Security module authorizes the operation.
4. Mutations enforce the existing same-origin policy and responses are not cached.
5. Existing RPC clients and Better Auth authentication continue using their current endpoints.

## Environment and integrations

Use existing Auth and Better Auth configuration. No new environment variables, databases, roles, or provider integrations are planned. Add only oRPC OpenAPI-related dependencies matched to the installed oRPC major/version.

## Proposed endpoint layout

- `/auth/api/openapi/...`: callable oRPC OpenAPI endpoints.
- `/auth/api/reference`: interactive documentation.
- `/auth/api/openapi.json`: generated specification.

The final paths must account for the Auth app's Next.js base path and remain consistent with the generated server URL.

## Open questions

- [x] Confirm the authenticated-only documentation scope and proposed endpoint layout.
- [x] Confirm the inclusion of a callable OpenAPI HTTP surface, needed for interactive requests.

## Implementation slices

1. Add oRPC OpenAPI support and procedure schemas/metadata; run `pnpm check`.
2. Wire authenticated reference, spec, and HTTP handler; run `pnpm check`.
3. Verify generated routes, authentication, origin protection, compatibility, UI, and production build.

## Validation checklist

- [x] Ownership, proposed routes, environment, authorization, and compatibility are described.
- [x] Confirm the proposed scope and record user sign-off.
- [x] Check generated specification against live endpoints and verify security behavior.

## Verification (2026-11-08)

- `pnpm test`: 16 passing tests, including generation of all eight paths, request/response/error schema presence, anonymous rejection, and authenticated user scoping.
- `pnpm check`, direct Auth typecheck, and Auth production build passed.
- Scalar loaded in an authenticated browser and a read-only provider request returned HTTP 200 with provider availability. Existing RPC sessions rendered normally.
- Anonymous reference and spec requests returned 401, same-origin anonymous API requests returned 401, and cross-origin POST requests returned 403. Responses were no-store.
- Mutating live account data was not performed; mutation behavior is protected by the existing module procedures and same-origin check and is covered only by focused automated tests where applicable.
