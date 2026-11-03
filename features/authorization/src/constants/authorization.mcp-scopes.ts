import type { ActionName } from "../types/authorization.action.types";

/** OAuth scopes advertised by `apps/auth` MCP plugin (Decision 7–8). */
export const MCP_BASE_SCOPE = "mcp:tools";

export const MCP_OAUTH_SCOPES = [
  "openid",
  "profile",
  "offline_access",
  MCP_BASE_SCOPE,
  "organizations:read",
  "organizations:write",
  "projects:read",
  "projects:write",
  "variables:read",
  "variables:write",
  "variables:reveal",
  "variables:export",
  "audit:read",
  "notifications:read",
  "notifications:write",
] as const;

export type McpOAuthScope = (typeof MCP_OAUTH_SCOPES)[number];

/** Plain-language labels for OAuth consent (apps/auth). */
export const MCP_OAUTH_SCOPE_DESCRIPTIONS: Record<McpOAuthScope, string> = {
  openid: "Verify your identity",
  profile: "View your name and profile picture",
  offline_access: "Stay signed in and refresh access in the background",
  "mcp:tools": "Use Loftlancer tools through MCP clients",
  "organizations:read": "View organizations you belong to",
  "organizations:write": "Create and manage organizations",
  "projects:read": "View projects and environments",
  "projects:write": "Create and manage projects and environments",
  "variables:read": "View environment variable names and metadata",
  "variables:write": "Create and update environment variables",
  "variables:reveal": "Reveal secret variable values",
  "variables:export": "Export environment variables",
  "audit:read": "View audit history",
  "notifications:read": "View your notifications",
  "notifications:write": "Manage notification preferences",
};

export function describeMcpOAuthScopes(
  scopeClaim: string | null | undefined,
): { scope: string; description: string }[] {
  if (!scopeClaim?.trim()) {
    return [];
  }
  return scopeClaim
    .split(/\s+/)
    .filter(Boolean)
    .map((scope) => ({
      scope,
      description:
        scope in MCP_OAUTH_SCOPE_DESCRIPTIONS
          ? MCP_OAUTH_SCOPE_DESCRIPTIONS[scope as McpOAuthScope]
          : scope,
    }));
}

const WRITE_VERBS = new Set([
  "create",
  "update",
  "delete",
  "restore",
  "archive",
  "unarchive",
  "grant",
  "revoke",
  "import",
  "export",
  "toggle",
  "change",
  "assign",
  "mark",
  "invite",
  "accept",
  "decline",
  "cancel",
  "bulk_import",
]);

function actionVerb(action: string): "read" | "write" | "reveal" | "export" {
  const parts = action.split(".");
  const verb = parts[parts.length - 1] ?? "read";
  if (verb === "reveal") return "reveal";
  if (verb === "export") return "export";
  if (WRITE_VERBS.has(verb)) return "write";
  return "read";
}

function resourcePrefix(action: string): string {
  const [domain] = action.split(".");
  switch (domain) {
    case "organization":
    case "member":
    case "team":
    case "invitation":
      return "organizations";
    case "project":
    case "environment":
      return "projects";
    case "variable":
      return "variables";
    case "audit":
      return "audit";
    case "notification":
      return "notifications";
    default:
      return "organizations";
  }
}

export function requiredOAuthScopesForAction(action: ActionName): string[] {
  if (action.startsWith("platform.")) {
    return [MCP_BASE_SCOPE, "platform:admin"];
  }
  if (action.startsWith("user.")) {
    return [MCP_BASE_SCOPE];
  }

  const prefix = resourcePrefix(action);
  const verb = actionVerb(action);

  if (prefix === "variables" && verb === "reveal") {
    return [MCP_BASE_SCOPE, "variables:reveal"];
  }
  if (prefix === "variables" && verb === "export") {
    return [MCP_BASE_SCOPE, "variables:export"];
  }
  if (prefix === "variables") {
    const scope = verb === "write" ? "variables:write" : "variables:read";
    return [MCP_BASE_SCOPE, scope];
  }

  const scope = verb === "write" ? `${prefix}:write` : `${prefix}:read`;
  return [MCP_BASE_SCOPE, scope];
}

export function parseGrantedScopes(scopeClaim: unknown): Set<string> {
  if (typeof scopeClaim !== "string" || !scopeClaim.trim()) {
    return new Set();
  }
  return new Set(scopeClaim.split(/\s+/).filter(Boolean));
}

export function tokenHasScopes(
  granted: Set<string>,
  required: readonly string[],
): boolean {
  return required.every((scope) => granted.has(scope));
}

export function mcpToolNameFromAction(action: ActionName): string {
  return action.replaceAll(".", "_");
}

export function actionFromMcpToolName(toolName: string): ActionName | null {
  const candidate = toolName.replaceAll("_", ".");
  return candidate as ActionName;
}
