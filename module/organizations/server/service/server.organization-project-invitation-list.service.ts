import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import {
  invitation,
  organization,
} from "@loftlancer/drizzle/schema/organization";
import { project } from "@loftlancer/drizzle/schema/projects";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, desc, eq, gt, ilike, isNull, lte, or, sql } from "drizzle-orm";
import type {
  OrganizationProjectInvitationListInput,
  OrganizationProjectInvitationListOutput,
} from "../../utils/validation/utils.organization-invitations.validation";

export async function organizationProjectInvitationListService(
  ctx: RunActionContext,
  input: OrganizationProjectInvitationListInput,
): Promise<ServiceOutcome<OrganizationProjectInvitationListOutput>> {
  if (!ctx.orgId)
    return { kind: "failed", message: "Select an organization first." };
  const [projectRow] = await db
    .select({ id: project.id })
    .from(project)
    .innerJoin(organization, eq(project.organizationId, organization.id))
    .where(
      and(
        eq(project.id, input.projectId),
        eq(project.organizationId, ctx.orgId),
        isNull(project.deletedAt),
        isNull(organization.deletedAt),
      ),
    )
    .limit(1);
  if (!projectRow) return { kind: "failed", message: "Project not found." };

  const scope = and(
    eq(invitation.projectId, input.projectId),
    isNull(invitation.deletedAt),
  );
  const searchable = and(
    scope,
    input.search
      ? or(
          ilike(invitation.email, `%${input.search}%`),
          ilike(user.name, `%${input.search}%`),
        )
      : undefined,
  );
  const now = new Date();
  const byStatus = {
    all: searchable,
    pending: and(
      searchable,
      eq(invitation.status, "pending"),
      gt(invitation.expiresAt, now),
    ),
    expired: and(
      searchable,
      eq(invitation.status, "pending"),
      lte(invitation.expiresAt, now),
    ),
    accepted: and(searchable, eq(invitation.status, "accepted")),
    rejected: and(searchable, eq(invitation.status, "rejected")),
    canceled: and(searchable, eq(invitation.status, "canceled")),
  };
  const where = byStatus[input.status];
  const [items, counts] = await Promise.all([
    db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
        lastSentAt: invitation.lastSentAt,
        acceptedAt: invitation.acceptedAt,
        rejectedAt: invitation.rejectedAt,
        revokedAt: invitation.revokedAt,
        expiresAt: invitation.expiresAt,
        inviterName: user.name,
      })
      .from(invitation)
      .leftJoin(user, eq(invitation.inviterId, user.id))
      .where(where)
      .orderBy(desc(invitation.createdAt))
      .limit(input.limit)
      .offset(input.offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(invitation)
      .leftJoin(user, eq(invitation.inviterId, user.id))
      .where(where),
  ]);
  return {
    kind: "success",
    data: { items, total: counts[0]?.total ?? 0 },
    message: "Project invitations loaded.",
  };
}
