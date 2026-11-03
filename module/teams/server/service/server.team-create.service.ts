import { db } from "@loftlancer/drizzle";
import { team, teamMember } from "@loftlancer/drizzle/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import type { TeamDto } from "../../utils/types/utils.team.dto";
import type { TeamCreateInput } from "../../utils/validation/utils.create-team.validation";
export async function teamCreateService(
  ctx: RunActionContext,
  input: TeamCreateInput,
): Promise<ServiceOutcome<TeamDto>> {
  if (!ctx.orgId)
    return { kind: "failed", message: "Select an organization to continue." };
  const organizationId = ctx.orgId;
  const row = await db.transaction(async (tx) => {
    const now = new Date();
    const id = crypto.randomUUID();
    const [created] = await tx
      .insert(team)
      .values({
        id,
        organizationId,
        name: input.name,
        description: input.description || null,
        purpose: input.purpose || null,
        memberCount: 1,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        updatedAt: now,
      })
      .returning();
    await tx.insert(teamMember).values({
      id: crypto.randomUUID(),
      teamId: id,
      userId: ctx.userId,
      role: "lead",
      addedBy: ctx.userId,
      updatedBy: ctx.userId,
      updatedAt: now,
    });
    if (!created) throw new Error("Team creation returned no row");
    return created;
  });
  return {
    kind: "success",
    data: {
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt?.toISOString() ?? null,
      createdByName: null,
      updatedByName: null,
    },
    message: "Team created",
  };
}
