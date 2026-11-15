import { requireMcpAuth } from "@better-auth/mcp"

import { mcpProtectedResourceScopes } from "./better-auth.oauth-mcp"
import { resolveMcpResourceUrl } from "./better-auth.oauth-mcp.paths"
import { getAuth } from "./better-auth.server"

type McpProtectedHandler = (
  request: Request,
  accessTokenClaims: Record<string, unknown>
) => Promise<Response> | Response

/** Wrap a route handler with MCP OAuth token verification. */
export function withMcpProtectedResource(handler: McpProtectedHandler) {
  const auth = getAuth()
  return requireMcpAuth(auth, handler, {
    resource: resolveMcpResourceUrl(),
    requiredScopes: [...mcpProtectedResourceScopes],
  })
}
