type TeamMembershipRow = { id: string; teamId: string };

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
