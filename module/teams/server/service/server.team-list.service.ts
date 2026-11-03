import { db } from "@loftlancer/drizzle";
import { team } from "@loftlancer/drizzle/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull } from "drizzle-orm";
import type { TeamDto } from "../../utils/types/utils.team.dto";
export async function teamListService(
  ctx: RunActionContext,
): Promise<ServiceOutcome<TeamDto>> {
  if (!ctx.orgId)
    return { kind: "failed", message: "Select an organization to continue." };
  const rows = await db
    .select()
    .from(team)
    .where(and(eq(team.organizationId, ctx.orgId), isNull(team.deletedAt)))
    .orderBy(team.name);
  return {
    kind: "success",
    data: rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt?.toISOString() ?? null,
      createdByName: null,
      updatedByName: null,
    })),
    message: rows.length ? "Teams loaded" : "No teams yet",
  };
}
