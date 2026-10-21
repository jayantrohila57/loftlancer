export type OrganizationInvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt?: Date | string;
  expiresAt: Date | string;
  inviterName?: string | null;
  teamName?: string | null;
  invitedTeamRole?: "member" | null;
  linkedProjects?: string[];
};

export function isPendingInvitationStatus(status: string | undefined): boolean {
  return status?.toLowerCase() === "pending";
}

export function parseOrganizationInvitations(
  data: unknown,
): OrganizationInvitationRow[] {
  if (Array.isArray(data)) {
    return data as OrganizationInvitationRow[];
  }
  if (data && typeof data === "object") {
    const nested = (data as { invitations?: unknown }).invitations;
    if (Array.isArray(nested)) {
      return nested as OrganizationInvitationRow[];
    }
  }
  return [];
}

/** Pending = status "pending" and not yet expired (matches the server, #251). */
function isLivePending(invite: {
  status?: string;
  expiresAt?: Date | string;
}): boolean {
  if (!isPendingInvitationStatus(invite.status)) return false;
  if (!invite.expiresAt) return true;
  return new Date(invite.expiresAt).getTime() > Date.now();
}

export function countPendingInvitations(
  invitations: readonly { status?: string; expiresAt?: Date | string }[],
): number {
  return invitations.filter(isLivePending).length;
}

export function pendingOrganizationInvitations(
  invitations: readonly OrganizationInvitationRow[],
): OrganizationInvitationRow[] {
  return invitations.filter(isLivePending);
}

export function sortOrganizationInvitations(
  invitations: readonly OrganizationInvitationRow[],
): OrganizationInvitationRow[] {
  return [...invitations].sort((a, b) => {
    if (a.status === b.status) return 0;
    if (isPendingInvitationStatus(a.status)) return -1;
    if (isPendingInvitationStatus(b.status)) return 1;
    return 0;
  });
}

export type OrganizationInviteRole = "member" | "owner" | "manager";

export function toOrganizationInviteRole(role: string): OrganizationInviteRole {
  const normalized = role.trim().toLowerCase();
  if (normalized === "owner" || normalized === "manager") {
    return normalized;
  }
  return "member";
}

export async function cancelOrganizationInvitation(
  client: {
    cancelInvitation?: (input: { invitationId: string }) => Promise<unknown>;
  },
  invitationId: string,
): Promise<void> {
  if (!client.cancelInvitation) {
    throw new Error("Revoke is not available for this workspace.");
  }
  await client.cancelInvitation({ invitationId });
}

export async function resendOrganizationInvitation(
  client: {
    inviteMember: (input: {
      email: string;
      role: OrganizationInviteRole;
      organizationId: string;
      resend?: boolean;
    }) => Promise<unknown>;
  },
  input: {
    organizationId: string;
    email: string;
    role: string;
  },
): Promise<void> {
  await client.inviteMember({
    email: input.email,
    role: toOrganizationInviteRole(input.role),
    organizationId: input.organizationId,
    resend: true,
  });
}
