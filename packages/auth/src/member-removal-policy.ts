type TeamMembershipRow = { id: string; teamId: string };

function rolesContain(role: string, expected: string) {
  return role
    .split(",")
    .map((item) => item.trim())
    .includes(expected);
}

export function isOwnerRole(role: string) {
  return rolesContain(role, "owner");
}

export function getOwnerMutationBlockReason(input: {
  targetRole: string;
  activeOwnerCount: number;
  nextRole?: string;
  removing?: boolean;
}): "last_owner" | null {
  if (!isOwnerRole(input.targetRole) || input.activeOwnerCount > 1) return null;
  if (input.removing || (input.nextRole && !isOwnerRole(input.nextRole))) {
    return "last_owner";
  }
  return null;
}

export function resolveOwnershipTransfer(input: {
  members: Array<{ id: string; userId: string; role: string }>;
  actorUserId: string;
  targetUserId: string;
}) {
  if (input.actorUserId === input.targetUserId) {
    throw new Error("Choose another organization member.");
  }
  const actor = input.members.find((row) => row.userId === input.actorUserId);
  if (!actor || !isOwnerRole(actor.role)) {
    throw new Error("Only an organization owner can transfer ownership.");
  }
  const target = input.members.find((row) => row.userId === input.targetUserId);
  if (!target) throw new Error("Select an active organization member.");
  return { actorMemberId: actor.id, targetMemberId: target.id };
}

export function getMemberRemovalBlockReason(input: {
  actorUserId: string;
  targetUserId: string;
  targetRole: string;
  activeOwnerCount: number;
}): "self" | "last_owner" | null {
  if (input.actorUserId === input.targetUserId) return "self";
  if (input.targetRole === "owner" && input.activeOwnerCount <= 1) {
    return "last_owner";
  }
  return null;
}

export function countTeamMembershipsByTeam(
  rows: TeamMembershipRow[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.teamId, (counts.get(row.teamId) ?? 0) + 1);
  }
  return counts;
}
