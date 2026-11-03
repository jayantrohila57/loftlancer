import { writeAuthAuditEvent } from "@features/authentication/core/server/authentication.auth-audit-event";
import { activeMemberWhere, db } from "@loftlancer/drizzle";
import { member, organization } from "@loftlancer/drizzle/schema/organization";
import { resolveOwnershipTransfer } from "@modules/organizations/utils/utils.member-removal-policy";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";

export async function transferOrganizationOwnership(input: {
  actorUserId: string;
  organizationId: string;
  targetUserId: string;
}) {
  if (input.actorUserId === input.targetUserId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Choose another organization member.",
    });
  }

  const transfer = await db.transaction(async (tx) => {
    const [org] = await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.id, input.organizationId),
          isNull(organization.deletedAt),
        ),
      )
      .for("update");
    if (!org)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found.",
      });

    const members = await tx
      .select({ id: member.id, userId: member.userId, role: member.role })
      .from(member)
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, input.organizationId),
            isNull(member.deletedAt),
          ),
        ),
      )
      .for("update");
    let change: ReturnType<typeof resolveOwnershipTransfer>;
    try {
      change = resolveOwnershipTransfer({
        members,
        actorUserId: input.actorUserId,
        targetUserId: input.targetUserId,
      });
    } catch (error) {
      throw new TRPCError({
        code:
          error instanceof Error && error.message.startsWith("Only")
            ? "FORBIDDEN"
            : "BAD_REQUEST",
        message:
          error instanceof Error
            ? error.message
            : "Ownership transfer is not allowed.",
      });
    }

    await tx
      .update(member)
      .set({ role: "owner" })
      .where(eq(member.id, change.targetMemberId));
    await tx
      .update(member)
      .set({ role: "manager" })
      .where(eq(member.id, change.actorMemberId));
    return { targetMemberId: change.targetMemberId };
  });

  await writeAuthAuditEvent({
    action: "organization.transfer_ownership",
    result: "success",
    actorUserId: input.actorUserId,
    organizationId: input.organizationId,
    entityId: transfer.targetMemberId,
    targetUserId: input.targetUserId,
    payload: { previousOwnerUserId: input.actorUserId },
  });

  return {
    organizationId: input.organizationId,
    newOwnerUserId: input.targetUserId,
  };
}
