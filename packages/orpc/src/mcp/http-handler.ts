import { createMcpSdkHttpHandler } from "@loftlancer/mcp";

import { registerMcpTools } from "./register-tools";

/** Product MCP HTTP handler: SDK glue + domain tool catalog. */
export function createLoftlancerMcpHttpHandler() {
  return createMcpSdkHttpHandler(registerMcpTools);
}
