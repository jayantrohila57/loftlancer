# Package `mcp`

MCP HTTP glue (`mcp-handler`, `@modelcontextprotocol/server`) and shared OAuth scope helpers. Folder **`mcp`** → **`@packages/mcp`**.

| Export                 | Use                                                                        |
| ---------------------- | -------------------------------------------------------------------------- |
| `@packages/mcp`        | Scope/tool-name helpers, rate-limit constants, shared types (browser-safe) |
| `@packages/mcp/server` | JWT resource gate, SDK HTTP handler, CORS, config resolvers                |

OAuth scope literals and consent i18n key map are defined here; **`@packages/better-auth`** re-exports them for the MCP plugin. `withMcpProtectedResource` stays in Better Auth. Consent UI lives in **`@modules/mcp-authorization`**, which imports scope keys from **`@packages/mcp`** (not Better Auth) so client bundles stay free of the auth server entry.

Domain MCP tool catalogs belong in modules; pass a `McpToolRegistrar` into `createMcpSdkHttpHandler`.

**Env:** `MCP_RESOURCE_URL` (via `@packages/t3-env/server`), optional `MCP_RATE_LIMIT_*` (validated in `@packages/t3-env/server`; read in `src/config/mcp.config.ts`).

**Next slice — Postgres-backed rate limits (not implemented):** when product approves MCP tool catalogs, add a `rate_limit_bucket` table (keyed by OAuth client id + window), wire `resolveMcpRateLimitConfig` to increment/check in Drizzle before `createMcpSdkHttpHandler` dispatches, and keep in-process limits as the dev fallback. No schema exists in this repo yet; do not add migrations until requirements sign off.
