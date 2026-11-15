import "@/shared/auth/auth.bootstrap"

import { createMcpSdkHttpHandler } from "@packages/mcp/server"

/**
 * MCP HTTP endpoint — JWT gate via `@packages/mcp/server`. Domain tools register
 * in modules through `McpToolRegistrar`; empty until catalogs are approved.
 */
const handleMcp = createMcpSdkHttpHandler(() => {})

export const POST = handleMcp
