# Packages — package.json and public API

**Previous:** [tree-and-scaffold.md](./tree-and-scaffold.md)  
**Next:** [new-package.md](./new-package.md)

## package.json baseline

- `"name": "@packages/<slug>"`, `"private": true`, `"type": "module"`.
- `"exports": { ".": "./src/index.ts" }` (or built output if standardized).
- `"scripts": { "typecheck": "..." }`.
- **MAY** depend on other `@packages/*`; **MUST NOT** create cycles.

## Public API

- Re-export **only** from `src/index.ts`.
- Consumers import **`@packages/<slug>`** — **MUST NOT** deep-import unexported `src/**`.
- **MUST NOT** add separate client/server public paths unless documented here.

## Config, env, SDK

- **`process.env` ONLY** in `config/<slug>.config.ts`.
- SDK/client construction **MUST** live in `integration/<slug>.integration.ts`.
- Vendor SDK imports **MUST** appear only in the owning package’s `integration/`.
- **`index.ts` MUST NOT** re-export server-only or secret-bearing modules on the default entry.

## Code quality

- **`strict`** from `@packages/typescript-config`; **MUST NOT** use explicit **`any`** — [../typescript-config/README.md](../typescript-config/README.md).
- **MUST NOT** add tsconfig `paths` mapping `@packages/ui/*` → `src/*` in apps/features — [typescript-config/README.md](../typescript-config/README.md).

## Workspace

- `packages/<slug>/` via pnpm `packages/*`.
- Consumers add `"@packages/<slug>": "workspace:*"` when needed.

## oRPC server entry

`@packages/ai/server` is a server-only AI SDK and Gateway primitive. Callers
must enforce authorization, entitlement, and usage metering before invoking it;
the package does not expose a public endpoint or grant access by itself.

`@packages/logger/server` is the server-only Winston logger; `@packages/logger`
exports runtime-safe logging for browser and Edge. Each app wires request error
hooks; auth oRPC procedures and the shared auth integration log at their own
boundaries. App routes must not add logging wrappers. Payloads are
bounded and secret-like keys and common token patterns are redacted. Other
payload values can include personal or business data: restrict log access and
retention. Pattern redaction cannot guarantee detection of every secret, so
do not put secrets in fields with misleading names or arbitrary free text.
Browser logs stay in the browser console; Edge logs use the runtime console;
Node logs use Winston. Activity IDs are logged alongside request IDs where
available. Handled errors need explicit log calls at their service boundary.
`activity.write.completed` reports that the write returned; when it runs inside
a transaction, the enclosing transaction can still roll back.

```ts
import { logger } from "@packages/logger/server"

const actionLogger = logger.child({
  app: "auth",
  module: "security",
  actionId,
  activityId,
})
actionLogger.error("activity.record.failed", { outcome: "error" })
```

`@packages/orpc/server` is the server-only entry for procedure construction and
HTTP handling. `@packages/orpc` exposes the client and TanStack Query integration;
client code must not import the server entry. Domain routers and auth context stay
in modules, and app routes only delegate to them.

`@packages/observability` exposes `@opentelemetry/api` helpers (`withSpan`,
`observabilityLogFields`). `@packages/observability/instrument-server` starts the
optional OTLP `NodeSDK` from each app's `instrumentation.ts` `register` on Node.
When OTLP tracing is active, pass `sentryTracingInitExtras()` into
`initAndWireSentryServer` so Sentry keeps errors/logs without duplicate performance
traces. Set `OBSERVABILITY_TRACING_PROVIDER=sentry` to reserve tracing for
`@packages/sentry` only. Root `package.json` hoists `@opentelemetry/api` for Next.js
peer resolution (same pattern as loftlancer).

`@packages/sentry` — instrumentation helpers (`instrument`, `instrument-server`,
`next-config`) and structured logger sink. Apps use `instrumentation.ts` +
`withSentryConfig`; DSN unset ⇒ no-op. See [../../packages/sentry/AGENTS.md](../../packages/sentry/AGENTS.md).

`@packages/mcp` — OAuth scope literals and consent i18n keys (client-safe).
`@packages/mcp/server` wraps `mcp-handler` and JWT resource auth; domain tools
register in modules. Consent UI stays in `@modules/mcp-authorization`. See
[../../packages/mcp/AGENTS.md](../../packages/mcp/AGENTS.md).

`@packages/posthog` — CDN loader, consent bridge, and identify helpers.
`NEXT_PUBLIC_POSTHOG_KEY` gates all behavior; Studio reads account analytics consent
from `@modules/privacy/client`. See [../../packages/posthog/AGENTS.md](../../packages/posthog/AGENTS.md).
