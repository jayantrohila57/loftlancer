import { normalizeOrgRole } from "@features/authorization/utils";
import { db } from "@loftlancer/drizzle";
import { member } from "@loftlancer/drizzle/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { loadMemberAccessSummary } from "@modules/organizations/server/member-access/service";
import { and, eq, isNull } from "drizzle-orm";
import type {
  OrganizationMemberAccessSummaryOutput,
  OrganizationMemberProfileInput,
  OrganizationMemberSuspendInput,
} from "../../utils/validation/utils.organization-admin.validation";

type Success = { success: true };
const failed = (message: string) => ({ kind: "failed" as const, message });

export async function organizationMemberProfileUpdateService(
  ctx: RunActionContext,
  input: OrganizationMemberProfileInput,
): Promise<ServiceOutcome<Success>> {
  if (!ctx.orgId) return failed("Select an organization first.");
  const [updated] = await db
    .update(member)
    .set({
      jobTitle: input.jobTitle || null,
      department: input.department || null,
      updatedAt: new Date(),
      updatedBy: ctx.userId,
    })
    .where(
      and(
        eq(member.id, input.memberId),
        eq(member.organizationId, ctx.orgId),
        isNull(member.deletedAt),
        isNull(member.suspendedAt),
      ),
    )
    .returning({ id: member.id });
  if (!updated) return failed("Active organization member not found.");
  return {
    kind: "success",
    data: { success: true },
    message: "Member profile updated.",
  };
}

export async function organizationMemberSetSuspendedService(
  ctx: RunActionContext,
  input: OrganizationMemberSuspendInput,
): Promise<ServiceOutcome<Success>> {
  if (!ctx.orgId) return failed("Select an organization first.");
  const [target] = await db
    .select({
      id: member.id,
      role: member.role,
      suspendedAt: member.suspendedAt,
    })
    .from(member)
    .where(
      and(
        eq(member.id, input.memberId),
        eq(member.organizationId, ctx.orgId),
        isNull(member.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return failed("Organization member not found.");
  if (normalizeOrgRole(target.role) === "owner")
    return failed("Transfer ownership before changing an owner's access.");
  if (input.suspended === Boolean(target.suspendedAt))
    return {
      kind: "success",
      data: { success: true },
      message: "Member access unchanged.",
    };
  await db
    .update(member)
    .set(
      input.suspended
        ? {
            suspendedAt: new Date(),
            suspendedBy: ctx.userId,
            suspensionReason: input.reason || null,
            updatedAt: new Date(),
            updatedBy: ctx.userId,
          }
        : {
            suspendedAt: null,
            suspendedBy: null,
            suspensionReason: null,
            updatedAt: new Date(),
            updatedBy: ctx.userId,
          },
    )
    .where(
      and(
        eq(member.id, target.id),
        eq(member.organizationId, ctx.orgId),
        isNull(member.deletedAt),
      ),
    );
  return {
    kind: "success",
    data: { success: true },
    message: input.suspended ? "Member suspended." : "Member reactivated.",
  };
}

export async function organizationMemberAccessSummaryService(
  ctx: RunActionContext,
  memberId: string,
): Promise<ServiceOutcome<OrganizationMemberAccessSummaryOutput>> {
  if (!ctx.orgId) return failed("Select an organization first.");
  const summary = await loadMemberAccessSummary({
    organizationId: ctx.orgId,
    memberId,
    viewerUserId: ctx.userId,
  });
  if (!summary) return failed("Member not found.");
  return {
    kind: "success",
    data: summary,
    message: "Member access summary loaded.",
  };
}
