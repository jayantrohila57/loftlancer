# `@loftlancer/mcp`

Thin **Model Context Protocol** integration (`mcp-handler`, `@modelcontextprotocol/server`, `@better-auth/mcp`).

## Layout

```text
src/
  core/mcp.handler.ts           # createMcpSdkHttpHandler(registerTools)
  core/mcp.resource-auth.ts     # JWT resource gate + claim helpers
  config/mcp.config.ts          # auth URLs + rate-limit env
  constants/mcp.constants.ts
  types/mcp.types.ts
  utils/mcp.cors.ts
  utils/mcp.rate-limit.ts
  utils/mcp.scopes.ts           # re-exports from @loftlancer/actions
  index.ts
tests/
```

## Boundary

| In this package                                        | Not here                                                 |
| ------------------------------------------------------ | -------------------------------------------------------- |
| SDK HTTP init, resource auth, CORS, rate-limit buckets | Domain tool catalogs / `runMcpTool` bodies               |
| Tool registrar _adapter_ (`McpToolRegistrar`)          | Action handlers → use `@loftlancer/orpc/mcp` → `module/` |

Compose the product MCP server in **`@loftlancer/orpc/mcp`** (`createLoftlancerMcpHttpHandler` + `registerMcpTools`).

## Env

| Variable                                                 | Role                 |
| -------------------------------------------------------- | -------------------- |
| `BETTER_AUTH_URL` / `NEXT_PUBLIC_AUTH_URL`               | OAuth issuer         |
| `MCP_RESOURCE_URL` / `NEXT_PUBLIC_MCP_URL`               | MCP audience base    |
| `MCP_RATE_LIMIT_WINDOW_MS`                               | Fixed-window ms      |
| `MCP_RATE_LIMIT_MAX_REQUESTS`                            | Default max / window |
| `MCP_RATE_LIMIT_MAX_WRITE` / `MCP_RATE_LIMIT_MAX_REVEAL` | Stricter caps        |
