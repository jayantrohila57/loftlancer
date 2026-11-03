import {
  getOwnerMutationBlockReason,
  isOwnerRole,
} from "@loftlancer/auth/member-removal-policy";
import { db, softDeleteSet } from "@loftlancer/db";
import { member, organization } from "@loftlancer/db/schema/organization";
import {
  projectManager,
  projectMemberGrant,
} from "@loftlancer/db/schema/project-access";
import { team, teamMember } from "@loftlancer/db/schema/team";
import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import type {
  OrganizationMemberRemoveInput,
  OrganizationMemberRemoveOutput,
} from "../../utils/validation/utils.organization-members.validation";

export async function organizationMemberRemoveService(
  ctx: RunActionContext,
  input: OrganizationMemberRemoveInput,
): Promise<ServiceOutcome<OrganizationMemberRemoveOutput>> {
  if (!ctx.orgId)
    return { kind: "failed", message: "Select an organization first." };
  const organizationId = ctx.orgId;

  const removed = await db.transaction(async (tx) => {
    const [activeOrg] = await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.id, organizationId),
          isNull(organization.deletedAt),
        ),
      )
      .for("update");
    if (!activeOrg) return { kind: "not-found" as const };

    const rows = await tx
      .select({ id: member.id, userId: member.userId, role: member.role })
      .from(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          isNull(member.deletedAt),
        ),
      )
      .for("update");
    const target = rows.find((row) => row.userId === input.userId);
    if (!target) return { kind: "not-found" as const };

    const ownerCount = rows.filter((row) => isOwnerRole(row.role)).length;
    if (
      getOwnerMutationBlockReason({
        targetRole: target.role,
        activeOwnerCount: ownerCount,
        removing: true,
      })
    ) {
      return { kind: "last-owner" as const };
    }

    const teamRows = await tx
      .select({ id: teamMember.id, teamId: teamMember.teamId })
      .from(teamMember)
      .innerJoin(team, eq(teamMember.teamId, team.id))
      .where(
        and(
          eq(team.organizationId, organizationId),
          eq(teamMember.userId, input.userId),
        ),
      );
    if (teamRows.length) {
      await tx.delete(teamMember).where(
        inArray(
          teamMember.id,
          teamRows.map((row) => row.id),
        ),
      );
      const counts = new Map<string, number>();
      for (const row of teamRows)
        counts.set(row.teamId, (counts.get(row.teamId) ?? 0) + 1);
      for (const [teamId, count] of counts) {
        await tx
          .update(team)
          .set({
            memberCount: sql`GREATEST(${team.memberCount} - ${count}, 0)`,
          })
          .where(
            and(eq(team.id, teamId), eq(team.organizationId, organizationId)),
          );
      }
    }

    const managerScope = and(
      eq(projectManager.organizationId, organizationId),
      eq(projectManager.userId, input.userId),
      isNull(projectManager.deletedAt),
    );
    const grantScope = and(
      eq(projectMemberGrant.organizationId, organizationId),
      eq(projectMemberGrant.userId, input.userId),
      isNull(projectMemberGrant.deletedAt),
    );
    if (isSoftDeletesEnabled()) {
      await tx
        .update(projectManager)
        .set(softDeleteSet(ctx.userId))
        .where(managerScope);
      await tx
        .update(projectMemberGrant)
        .set(softDeleteSet(ctx.userId))
        .where(grantScope);
      await tx
        .update(member)
        .set({
          ...softDeleteSet(ctx.userId),
          removalReason: input.reason?.trim().slice(0, 250) || null,
          updatedAt: new Date(),
          updatedBy: ctx.userId,
        })
        .where(eq(member.id, target.id));
    } else {
      await tx.delete(projectManager).where(managerScope);
      await tx.delete(projectMemberGrant).where(grantScope);
      await tx.delete(member).where(eq(member.id, target.id));
    }
    return { kind: "success" as const };
  });

  if (removed.kind === "not-found")
    return { kind: "failed", message: "Organization member not found." };
  if (removed.kind === "last-owner")
    return {
      kind: "failed",
      message: "Transfer ownership first; the organization must have an owner.",
    };
  return {
    kind: "success",
    data: { success: true, userId: input.userId },
    message: "Organization member removed.",
  };
}
