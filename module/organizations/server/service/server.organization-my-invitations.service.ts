import { db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { invitation, organization } from "@loftlancer/db/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import type { OrganizationMyInvitationsOutput } from "../../utils/validation/utils.organization-invitations.validation";

export async function organizationMyInvitationsService(
  ctx: RunActionContext & { email: string; emailVerified: boolean },
): Promise<ServiceOutcome<OrganizationMyInvitationsOutput>> {
  if (!ctx.emailVerified) {
    return {
      kind: "success",
      data: { items: [] },
      message: "Invitations loaded.",
    };
  }
  const rows = await db
    .select({
      id: invitation.id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      role: invitation.role,
      inviterName: user.name,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .leftJoin(user, eq(invitation.inviterId, user.id))
    .where(
      and(
        sql`lower(${invitation.email}) = lower(${ctx.email})`,
        eq(invitation.status, "pending"),
        isNull(invitation.deletedAt),
        isNull(organization.deletedAt),
        gt(invitation.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(invitation.createdAt));
  return {
    kind: "success",
    data: { items: rows },
    message: "Invitations loaded.",
  };
}
