/**
 * Product reset: organization / teams MCP domain ops removed.
 * Handlers that still register tools call these stubs and receive a clear error.
 */
const REMOVED =
  "Domain removed: organizations/teams MCP operations are no longer available.";

async function removed(): Promise<never> {
  throw new Error(REMOVED);
}

export const mcpOrganizationCreate = removed;
export const mcpOrganizationUpdate = removed;
export const mcpOrganizationDelete = removed;
export const mcpOrganizationRestore = removed;
export const mcpOrganizationView = removed;
export const mcpOrganizationTransferOwnership = removed;
export const mcpMembersList = removed;
export const mcpMemberSetSuspended = removed;
export const mcpMemberInvite = removed;
export const mcpMemberRemove = removed;
export const mcpMemberUpdateRole = removed;
export const mcpInvitationsList = removed;
export const mcpInvitationCancel = removed;
export const mcpInvitationAccept = removed;
export const mcpInvitationReject = removed;
export const mcpTeamsList = removed;
export const teamMembersList = removed;
export const teamEligibleMembersList = removed;
export const mcpTeamCreate = removed;
export const mcpTeamUpdate = removed;
export const mcpTeamDelete = removed;
export const mcpTeamRestore = removed;
export const mcpTeamAddMember = removed;
export const mcpTeamRemoveMember = removed;
export const mcpTeamChangeMemberRole = removed;

export async function resolveOrgFromInput(
  _userId: string,
  _input: { organizationId?: string; organizationSlug?: string },
): Promise<string | null> {
  return null;
}
