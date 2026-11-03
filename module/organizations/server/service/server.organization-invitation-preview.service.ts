import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import {
  invitation,
  organization,
} from "@loftlancer/drizzle/schema/organization";
import { projectTeam } from "@loftlancer/drizzle/schema/project-access";
import { project } from "@loftlancer/drizzle/schema/projects";
import { team } from "@loftlancer/drizzle/schema/team";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull } from "drizzle-orm";
import { getPublicInvitationStatus } from "../../utils/utils.public-invitation-status";
import type {
  OrganizationInvitationPreviewInput,
  OrganizationInvitationPreviewOutput,
} from "../../utils/validation/utils.organization-invitations.validation";

export async function organizationInvitationPreviewService(
  input: OrganizationInvitationPreviewInput,
): Promise<ServiceOutcome<OrganizationInvitationPreviewOutput>> {
  const [row] = await db
    .select({
      organizationId: invitation.organizationId,
      status: invitation.status,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      invitationDeletedAt: invitation.deletedAt,
      organizationDeletedAt: organization.deletedAt,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      inviterName: user.name,
      projectId: invitation.projectId,
      projectName: project.name,
      projectSlug: project.slug,
      projectDeletedAt: project.deletedAt,
      teamId: invitation.teamId,
      teamName: team.name,
      teamDeletedAt: team.deletedAt,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .leftJoin(user, eq(invitation.inviterId, user.id))
    .leftJoin(
      project,
      and(
        eq(invitation.projectId, project.id),
        eq(invitation.organizationId, project.organizationId),
      ),
    )
    .leftJoin(
      team,
      and(
        eq(invitation.teamId, team.id),
        eq(invitation.organizationId, team.organizationId),
      ),
    )
    .where(eq(invitation.id, input.invitationId))
    .limit(1);
  if (!row)
    return {
      kind: "success",
      data: { status: "not_found" },
      message: "Invitation preview loaded.",
    };

  const linkedProjects = row.teamId
    ? await db
        .select({ name: project.name, slug: project.slug })
        .from(projectTeam)
        .innerJoin(project, eq(projectTeam.projectId, project.id))
        .where(
          and(
            eq(projectTeam.teamId, row.teamId),
            eq(projectTeam.organizationId, row.organizationId),
            isNull(projectTeam.deletedAt),
            isNull(project.deletedAt),
          ),
        )
        .orderBy(project.name)
    : [];
  const status =
    (row.projectId && row.projectDeletedAt) || (row.teamId && !row.teamName)
      ? ("unavailable" as const)
      : getPublicInvitationStatus({
          status: row.status,
          expiresAt: row.expiresAt,
          deletedAt: row.invitationDeletedAt,
          organizationDeletedAt: row.organizationDeletedAt,
          teamDeletedAt: row.teamDeletedAt,
        });
  return {
    kind: "success",
    data: {
      status,
      organizationName: row.organizationName,
      organizationSlug: row.organizationSlug,
      role: row.role,
      inviterName: row.inviterName,
      projectId: row.projectId,
      projectName: row.projectName,
      projectSlug: row.projectSlug,
      teamId: row.teamId,
      teamName: row.teamName,
      invitedTeamRole: row.teamId ? "member" : null,
      linkedProjects,
    },
    message: "Invitation preview loaded.",
  };
}
