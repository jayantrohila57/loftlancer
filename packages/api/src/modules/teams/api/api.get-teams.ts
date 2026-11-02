import { requireAction } from "../../../actions/require-action";
import { mcpTeamsList } from "../../../mcp/organization-ops";

export type GetTeamsContext = {
  userId: string;
  organizationId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/**
 * The module-owned Teams read operation. HTTP/RPC adapters only supply request
 * context; permission enforcement lives with the operation itself.
 */
export async function getTeams(context: GetTeamsContext) {
  if (!context.organizationId) {
    return { items: [] };
  }

  await requireAction("member.list", {
    userId: context.userId,
    organizationId: context.organizationId,
    ipAddress: context.ipAddress ?? null,
    userAgent: context.userAgent ?? null,
    audit: false,
  });

  return mcpTeamsList(context.userId, context.organizationId);
}
