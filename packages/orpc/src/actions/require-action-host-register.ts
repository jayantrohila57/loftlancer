import { setAuditEventWriterHost } from "@features/authorization/core/server/authorization.audit-event-writer-host";
import { setRequireActionHost } from "@features/authorization/core/server/authorization.require-action-host";
import { isAppInstalled } from "@modules/apps/server/installed";
import { hasProjectAppAccess } from "@modules/apps/server/project-app-access";
import { getConsoleAuditContext } from "../console-audit-context";
import { getMcpAuditContext } from "../mcp-audit-context";
import { loadCustomOrganizationActions } from "./custom-role-permissions";
import {
  loadProjectAccessContext,
  userHasAnyProjectManagerAssignment,
} from "./project-access";
import { loadTeamAccessContext } from "./team-access";

let registered = false;

/** Registers API/domain loaders required by @features/authorization server helpers. */
export function registerAuthorizationHosts(): void {
  if (registered) return;
  registered = true;

  setRequireActionHost({
    isAppInstalled,
    hasProjectAppAccess,
    loadCustomOrganizationActions,
    loadProjectAccessContext,
    loadTeamAccessContext: async (userId, teamId, organizationId) => {
      if (!organizationId) {
        return null;
      }
      return loadTeamAccessContext(userId, teamId, organizationId);
    },
    userHasAnyProjectManagerAssignment,
  });

  setAuditEventWriterHost({
    resolveTransportContext: () => {
      const mcp = getMcpAuditContext();
      const consoleCtx = getConsoleAuditContext();
      return {
        source: consoleCtx?.source ?? mcp?.source ?? "trpc",
        oauthClientId: mcp?.oauthClientId ?? null,
        mcpTool: mcp?.mcpTool ?? null,
      };
    },
  });
}

registerAuthorizationHosts();
