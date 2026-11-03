import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import { team } from "@loftlancer/drizzle/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { TeamDto } from "../../utils/types/utils.team.dto";
export async function teamGetService(
  ctx: RunActionContext,
  input: { teamId: string },
): Promise<ServiceOutcome<TeamDto>> {
  if (!ctx.orgId)
    return { kind: "failed", message: "Select an organization to continue." };
  const creator = alias(user, "team_creator");
  const updater = alias(user, "team_updater");
  const [row] = await db
    .select({
      id: team.id,
      name: team.name,
      description: team.description,
      purpose: team.purpose,
      organizationId: team.organizationId,
      createdAt: team.createdAt,
      createdByName: creator.name,
      updatedAt: team.updatedAt,
      updatedByName: updater.name,
    })
    .from(team)
    .leftJoin(creator, eq(team.createdBy, creator.id))
    .leftJoin(updater, eq(team.updatedBy, updater.id))
    .where(
      and(
        eq(team.id, input.teamId),
        eq(team.organizationId, ctx.orgId),
        isNull(team.deletedAt),
      ),
    )
    .limit(1);
  if (!row) return { kind: "failed", message: "Team not found." };
  return {
    kind: "success",
    data: {
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt?.toISOString() ?? null,
    },
    message: "Team loaded",
  };
}
