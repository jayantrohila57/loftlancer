import { resolveOwnershipTransfer } from "@loftlancer/auth/member-removal-policy";
import { activeMemberWhere, db } from "@loftlancer/db";
import { member, organization } from "@loftlancer/db/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull, sql } from "drizzle-orm";

type Success = { success: true };
const failed = (message: string) => ({ kind: "failed" as const, message });

export async function organizationArchiveService(
  ctx: RunActionContext,
): Promise<ServiceOutcome<Success>> {
  if (!ctx.orgId) return failed("Select an organization first.");
  const now = new Date();
  const [row] = await db
    .update(organization)
    .set({
      archivedAt: now,
      archivedBy: ctx.userId,
      updatedAt: now,
      updatedBy: ctx.userId,
    })
    .where(
      and(
        eq(organization.id, ctx.orgId),
        isNull(organization.deletedAt),
        isNull(organization.archivedAt),
      ),
    )
    .returning({ id: organization.id });
  if (!row) return failed("Organization is already archived or unavailable.");
  return {
    kind: "success",
    data: { success: true },
    message: "Organization archived.",
  };
}

export async function organizationUnarchiveService(
  ctx: RunActionContext,
): Promise<ServiceOutcome<Success>> {
  if (!ctx.orgId) return failed("Select an organization first.");
  const [row] = await db
    .update(organization)
    .set({
      archivedAt: null,
      archivedBy: null,
      updatedAt: new Date(),
      updatedBy: ctx.userId,
    })
    .where(
      and(
        eq(organization.id, ctx.orgId),
        isNull(organization.deletedAt),
        sql`${organization.archivedAt} IS NOT NULL`,
      ),
    )
    .returning({ id: organization.id });
  if (!row) return failed("Organization is not archived or is unavailable.");
  return {
    kind: "success",
    data: { success: true },
    message: "Organization restored.",
  };
}

export async function organizationTransferOwnershipService(
  ctx: RunActionContext,
  targetUserId: string,
): Promise<ServiceOutcome<{ organizationId: string; newOwnerUserId: string }>> {
  if (!ctx.orgId) return failed("Select an organization first.");
  const organizationId = ctx.orgId;
  if (ctx.userId === targetUserId)
    return failed("Choose another organization member.");
  const outcome = await db.transaction(async (tx) => {
    const [org] = await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.id, organizationId),
          isNull(organization.deletedAt),
        ),
      )
      .for("update");
    if (!org) return { kind: "not-found" as const };
    const members = await tx
      .select({ id: member.id, userId: member.userId, role: member.role })
      .from(member)
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, organizationId),
            isNull(member.deletedAt),
          ),
        ),
      )
      .for("update");
    try {
      const change = resolveOwnershipTransfer({
        members,
        actorUserId: ctx.userId,
        targetUserId,
      });
      await tx
        .update(member)
        .set({ role: "owner" })
        .where(eq(member.id, change.targetMemberId));
      await tx
        .update(member)
        .set({ role: "manager" })
        .where(eq(member.id, change.actorMemberId));
      return { kind: "success" as const };
    } catch (error) {
      return {
        kind: "failed" as const,
        message:
          error instanceof Error
            ? error.message
            : "Ownership transfer is not allowed.",
      };
    }
  });
  if (outcome.kind === "not-found") return failed("Organization not found.");
  if (outcome.kind === "failed") return outcome;
  return {
    kind: "success",
    data: { organizationId: ctx.orgId, newOwnerUserId: targetUserId },
    message: "Organization ownership transferred.",
  };
}
