import { createMcpHandler } from "mcp-handler"

import type { McpToolRegistrar } from "../types/mcp.types"
import { createMcpResourceHandler } from "./mcp.resource-auth"

/**
 * MCP HTTP handler: resource JWT gate + `mcp-handler` server.
 * Pass a tool registrar from a module — no domain tools in this package.
 */
export function createMcpSdkHttpHandler(registerTools: McpToolRegistrar) {
  return createMcpResourceHandler(async (request, claims) => {
    const handler = createMcpHandler((server) => {
      registerTools(server, claims)
    })
    return handler(request)
  })
}
