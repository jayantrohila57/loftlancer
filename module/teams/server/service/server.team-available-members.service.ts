import { db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { member } from "@loftlancer/db/schema/organization";
import { team, teamMember } from "@loftlancer/db/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull } from "drizzle-orm";
import type { z } from "zod";
import type { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamOutcome } from "./server.team-outcome.service";

async function perform(
  _userId: string,
  organizationId: string,
  teamId: string,
) {
  const [teamRow] = await db
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
  if (!teamRow) throw new Error("Team not found");
  const rows = await db
    .select({ userId: member.userId, name: user.name, email: user.email })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .leftJoin(
      teamMember,
      and(eq(teamMember.teamId, teamId), eq(teamMember.userId, member.userId)),
    )
    .where(
      and(
        eq(member.organizationId, organizationId),
        isNull(member.deletedAt),
        isNull(teamMember.id),
      ),
    )
    .orderBy(user.name);
  return rows;
}

export function teamAvailableMembersService(
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
    "Available members loaded",
  );
}
