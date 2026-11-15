# Modules — API structure (orpc + React Query)

**Prev:** [ui-tree.md](./ui-tree.md)

[oRPC](https://orpc.dev) routers live in the module; React Query hooks serve client leaves. The Auth app is migrating incrementally and retains existing HTTP endpoints for compatibility.

Planned layout (per domain slug):

```text
modules/<slug>/src/
  server/        # module router, controller, services, repositories
  client/        # useQuery / useMutation wrappers and components
  utils/         # shared config, constants, types, and validation
```

| Layer      | Role                                    |
| ---------- | --------------------------------------- |
| Router     | HTTP/RPC surface, input parsing         |
| Controller | Orchestration, authz checks             |
| Service    | Business logic                          |
| Domain     | Standalone module owning its capability |

App `route.ts` **MAY** delegate to module router — **MUST NOT** duplicate procedures in `apps/`.

**Cache Components:** put read-mostly procedure results behind module services using **`'use cache'`** and **`cacheTag('<slug>:…')`**; invalidate from mutations. Per-user procedure output stays in **Suspense**-wrapped server components, not in the app route file.

## Auth app conventions

The activity, location, sessions, and connected-accounts modules own their capabilities; the security module currently composes compatibility routes and shared infrastructure. The security hook facade groups hooks under `api.security.use...`. Hooks use Better Auth directly for its account APIs and oRPC for application-owned operations. Query keys include the current user ID; successful mutations invalidate the affected module keys. The Auth query provider clears its browser cache when the resolved user changes.

The Auth app delegates `/api/rpc/[[...path]]` to a module-owned oRPC router. Its protected procedures resolve the Better Auth session from request headers and scope queries and mutations to that session user. The RPC route accepts same-origin POST requests and marks responses `no-store`. Better Auth retains its own `/api/auth` route. Existing account HTTP routes remain available during migration.

Server-rendered components should call module services or server-only procedures directly with request-scoped context; browser hooks cannot run on the server. This migration does not currently provide a generic server caller.

## Scalar and OpenAPI

The Auth app serves the [Scalar reference](/auth/api/reference) and [OpenAPI JSON](/auth/api/openapi.json) to users with a valid Better Auth session. Sign in to the Auth app before opening either URL. Scalar loads its reference client from the oRPC plugin's configured CDN.

The protected procedure documents the required `Origin` header; the Auth app HTTP handlers enforce it before invoking oRPC. Any new HTTP mount must enforce the same origin check.

The spec describes the Security router's oRPC procedures under `/auth/api/openapi/security/…`; each uses `POST` with JSON for inputs. Requests must carry the session cookie and an `Origin` matching the Auth app. Responses are `no-store`. Better Auth's own `/api/auth` endpoints and the compatibility HTTP endpoints are separate and not included in this specification. The existing `/api/rpc` interface is unchanged.

The activity oRPC operations use the shared response envelope: `success`, `failed`, or `error`, with `message`, `data`, and error details when applicable. Activity list receives `{ query: { kind, page, type?, since? } }`; delete receives `{ payload: { kind } }`. The authenticated user ID is supplied by the server. Invalid procedure input returns `failed` with HTTP 200, while malformed transport requests, authentication failures, and origin rejection may occur before a procedure runs. Existing `/api/account/activity` compatibility requests and responses retain their prior shape. The connected-accounts provider-list operation also uses the shared response envelope; its Better Auth account operations remain Better Auth client calls. The sessions-list operation also uses the shared envelope; session revocation remains a Better Auth operation. Location get, preference, save, and delete also use the shared envelope; preference and save accept a `payload` object. The compatibility location endpoint has the generation requirement described below.

Location reads return a nonnegative `generation`. Capture clients must read it before requesting geolocation and include it in the save payload. Deleting history advances the generation without changing consent; stale saves return `LOCATION_STALE` through oRPC or HTTP 409 through the compatibility endpoint. Older save clients without a generation receive an invalid-input response (HTTP 400 on the compatibility endpoint) and must refresh or upgrade. Apply migration `0011_classy_angel` before deploying this contract.

Unified activity uses `security.activity.feed`, `security.activity.detail`, and `security.activity.clear`, also exposed at `/auth/api/openapi/security/activity/feed`, `/detail`, and `/clear`. Feed accepts `{ query: { scope?, category?, actionId?, outcome?, sourceModule?, since?, until?, cursor?, limit? } }` where optional `scope` is `account`, `security`, or `resource`; detail accepts `{ query: { activityId } }`; clear accepts `{ payload: { scope: "all" } }` or `{ payload: { scope: "category", category } }`. The server supplies the owner, validates cursors and returns `canViewTarget` plus an allowlisted account target URL when available. Resource targets without a resolver remain unavailable. Detail includes permitted device and location context. Existing activity routes remain available.

Server producers import `beginActivity` and `recordActivity` from `@modules/activity/server`. Create the context before an action, keep its ID for retries, then record the actual outcome. Pass the database transaction when the event and mutation share it. Add new action definitions and allowlisted metadata in `activity.actions.ts`; before/after values require a registered critical-change schema. Location privacy, regional and appearance updates use this recorder. Profile, session, and provider-unlink hooks currently write through the legacy bridge; verified OAuth provider linking records `security.provider.link`. Failed sign-in attribution remains unset when the user cannot be identified safely. No browser endpoint can create arbitrary events.

Regional preferences use `POST /openapi/security/regional-preferences/get` and `POST /openapi/security/regional-preferences/update`, mounted below `/auth/api`. The equivalent typed oRPC operations are `security.regionalPreferences.get` and `security.regionalPreferences.update`. Updates accept `{ "payload": { ... } }` with one or more fields; omitted fields remain unchanged and explicit `null` clears a selection. The session determines ownership, and a client-supplied user ID is rejected. Unset values are returned as `null` and do not imply a currency, region, or measurement system. The API stores choices only; it does not change routing or formatting by itself.

The fields are `language` (one of the app's three locale tags), `region` (ISO 3166-1 alpha-2), `currency` (ISO 4217 alpha-3), `timeZone` (a named IANA zone accepted by the runtime), `dateStyle` (`short`, `medium`, `long`), `hourCycle` (`h12`, `h23`), `numberGrouping` (`auto`, `never`), and `measurementSystem` (`metric`, `us`, `uk`). Region and currency validation uses the checked-in `iso-codes` 4.20.1 snapshot; update it as those standards change. Supported time-zone aliases depend on the deployed runtime's ICU data. Currency is a display preference, never a currency conversion or a replacement for a transaction's currency. See [currency and measurement policy](../features/i18n/currency-and-measurements.md) for consumer inventory and the no–silent-conversion rule.

To add an operation, define route metadata and input/output schemas on its module-owned procedure. Add the operation to the relevant module router; the OpenAPI handler and spec use the same router. Update `tests/orpc-openapi.test.tsx` and verify the endpoint, authorization, and origin behavior. Session-list responses include session tokens and must be handled as sensitive data.

**Next:** [internal-shared.md](./internal-shared.md)

For local debugging, the Auth app mounts React Query Devtools inside its query provider. TanStack excludes the devtools UI from production builds. Query and mutation state may include account data, so use it only in a trusted development environment.
