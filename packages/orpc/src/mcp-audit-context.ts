import { AsyncLocalStorage } from "node:async_hooks";

export type McpAuditContext = {
  source: "mcp";
  oauthClientId: string | null;
  mcpTool: string;
};

const storage = new AsyncLocalStorage<McpAuditContext>();

export function runWithMcpAuditContext<T>(
  context: McpAuditContext,
  fn: () => T | Promise<T>,
): Promise<T> {
  return Promise.resolve(storage.run(context, fn));
}

export function getMcpAuditContext(): McpAuditContext | undefined {
  return storage.getStore();
}
