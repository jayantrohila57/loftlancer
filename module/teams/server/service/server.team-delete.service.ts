import { db, softDeleteSet } from "@loftlancer/db";
import { invitation, organization } from "@loftlancer/db/schema/organization";
import { team } from "@loftlancer/db/schema/team";
import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull } from "drizzle-orm";
import type { z } from "zod";
import type { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamOutcome } from "./server.team-outcome.service";

async function perform(userId: string, organizationId: string, teamId: string) {
  await db.transaction(async (tx) => {
    const [activeOrganization] = await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.id, organizationId),
          isNull(organization.deletedAt),
        ),
      )
      .for("update");
    if (!activeOrganization) throw new Error("organization_not_found");
    const [existing] = await tx
      .select({ id: team.id })
      .from(team)
      .where(
        and(
          eq(team.id, teamId),
          eq(team.organizationId, organizationId),
          isNull(team.deletedAt),
        ),
      )
      .for("update");
    if (!existing) throw new Error("team_not_found");
    await tx
      .update(invitation)
      .set({
        status: "canceled",
        revokedAt: new Date(),
        revokedBy: userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(invitation.organizationId, organizationId),
          eq(invitation.teamId, teamId),
          eq(invitation.status, "pending"),
        ),
      );
    if (isSoftDeletesEnabled()) {
      await tx
        .update(team)
        .set(softDeleteSet(userId))
        .where(
          and(eq(team.id, teamId), eq(team.organizationId, organizationId)),
        );
    } else {
      await tx
        .delete(team)
        .where(
          and(eq(team.id, teamId), eq(team.organizationId, organizationId)),
        );
    }
  });
  return { success: true, teamId };
}

export function teamDeleteService(
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
    "Team deleted",
  );
}
