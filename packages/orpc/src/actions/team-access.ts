import { db } from "@loftlancer/drizzle";
import { team, teamMember } from "@loftlancer/drizzle/schema/team";
import { and, eq, isNull } from "drizzle-orm";

export async function loadTeamAccessContext(
  userId: string,
  teamId: string,
  organizationId: string,
) {
  const [row] = await db
    .select({ organizationId: team.organizationId, role: teamMember.role })
    .from(team)
    .leftJoin(
      teamMember,
      and(eq(teamMember.teamId, team.id), eq(teamMember.userId, userId)),
    )
    .where(and(eq(team.id, teamId), isNull(team.deletedAt)))
    .limit(1);
  const belongsToOrganization = row?.organizationId === organizationId;
  return {
    belongsToOrganization,
    role:
      belongsToOrganization && (row?.role === "lead" || row?.role === "member")
        ? row.role
        : null,
  } as const;
}
