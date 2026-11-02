import { db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { member } from "@loftlancer/db/schema/organization";
import { team, teamMember } from "@loftlancer/db/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { z } from "zod";
import type { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamOutcome } from "./server.team-outcome.service";

async function perform(
  _userId: string,
  organizationId: string,
  teamId: string,
) {
  const [row] = await db
    .select({ id: team.id })
    .from(team)
    .where(
      and(
        eq(team.id, teamId),
        eq(team.organizationId, organizationId),
        isNull(team.deletedAt),
      ),
    )
    .limit(1);
  if (!row) {
    throw new Error("Team not found");
  }
  const addedBy = alias(user, "team_member_added_by");
  const updatedBy = alias(user, "team_member_updated_by");
  const rows = await db
    .select({
      id: teamMember.id,
      userId: teamMember.userId,
      teamId: teamMember.teamId,
      role: teamMember.role,
      createdAt: teamMember.createdAt,
      addedByName: addedBy.name,
      updatedAt: teamMember.updatedAt,
      updatedByName: updatedBy.name,
      name: user.name,
      email: user.email,
    })
    .from(teamMember)
    .innerJoin(
      member,
      and(
        eq(member.userId, teamMember.userId),
        eq(member.organizationId, organizationId),
        isNull(member.deletedAt),
      ),
    )
    .innerJoin(user, eq(user.id, teamMember.userId))
    .leftJoin(addedBy, eq(addedBy.id, teamMember.addedBy))
    .leftJoin(updatedBy, eq(updatedBy.id, teamMember.updatedBy))
    .where(eq(teamMember.teamId, teamId));
  return rows;
}

export function teamMembersService(
  ctx: RunActionContext,
  input: z.infer<typeof teamGetInputSchema>,
) {
  if (!ctx.orgId)
    return Promise.resolve({
      kind: "failed" as const,
      message: "Select an organization to continue.",
    });
  const organizationId = ctx.orgId;
  return teamOutcome(
    () => perform(ctx.userId, organizationId, input.teamId),
    "Team members loaded",
  );
}
