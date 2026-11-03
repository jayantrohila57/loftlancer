import type { ActionName } from "@features/authorization/utils";

import catalog from "@/generated/mcp-tools-catalog.json";

export type McpToolMetadata = {
  action: ActionName;
  toolName: string;
  description: string;
  scopes: string[];
  inputSchema: Record<string, unknown>;
  orgRoles: string[] | null;
  requiresProjectGrant: boolean;
};

const rows = catalog as McpToolMetadata[];

export function listMcpToolMetadata(): McpToolMetadata[] {
  return rows;
}

export function getMcpToolMetadata(action: ActionName): McpToolMetadata | null {
  return rows.find((row) => row.action === action) ?? null;
}
