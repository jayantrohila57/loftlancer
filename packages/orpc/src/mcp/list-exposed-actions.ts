import { type ActionName, actionRegistry } from "@features/authorization/utils";
import { mcpActionHandlers } from "./handlers";

const EXCLUDED_SCOPES = new Set<ActionName>([
  "platform.user.list",
  "platform.user.set_role",
  "platform.user.impersonate",
]);

/** Canonical actions implemented as MCP tools (excludes account/session/profile user scope). */
export function listMcpExposedActions(): ActionName[] {
  const implemented = new Set(Object.keys(mcpActionHandlers) as ActionName[]);
  return Object.values(actionRegistry)
    .map((def) => def.name as ActionName)
    .filter((name) => !name.startsWith("platform."))
    .filter((name) => !EXCLUDED_SCOPES.has(name))
    .filter((name) => actionRegistry[name]?.scope !== "user")
    .filter((name) => implemented.has(name))
    .sort();
}
