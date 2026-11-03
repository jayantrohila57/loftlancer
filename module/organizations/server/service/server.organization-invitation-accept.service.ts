import {
  DEFAULT_TEAM_PROJECT_GRANTS,
  mergeProjectMemberGrants,
} from "@loftlancer/actions";
import { activeInvitationWhere, db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import {
  invitation,
  member,
  organization,
} from "@loftlancer/db/schema/organization";
import { projectMemberGrant } from "@loftlancer/db/schema/project-access";
import { project } from "@loftlancer/db/schema/projects";
import { team, teamMember } from "@loftlancer/db/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { applyTeamProjectDefaults } from "@module/teams/server/service/server.team-project-defaults.service";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import type {
  OrganizationInvitationAcceptInput,
  OrganizationInvitationAcceptOutput,
} from "../../utils/validation/utils.organization-invitations.validation";

export async function organizationInvitationAcceptService(
  ctx: RunActionContext,
  input: OrganizationInvitationAcceptInput,
  options: { invitationType?: "team" | "project" },
): Promise<ServiceOutcome<OrganizationInvitationAcceptOutput>> {
  const [actor] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, ctx.userId))
    .limit(1);
  const actorEmail = actor?.email;
  if (!actorEmail)
    return { kind: "failed", message: "Invitation email does not match." };
  const now = new Date();
  const [candidate] = await db
    .select({
      email: invitation.email,
      organizationId: invitation.organizationId,
    })
    .from(invitation)
    .where(
      activeInvitationWhere(
        and(
          eq(invitation.id, input.invitationId),
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, now),
        ),
      ),
    )
    .limit(1);
  if (!candidate) return { kind: "failed", message: "Invitation not found." };
  if (actorEmail.trim().toLowerCase() !== candidate.email.trim().toLowerCase())
    return { kind: "failed", message: "Invitation email does not match." };

  const accepted = await db.transaction(async (tx) => {
    const [activeOrg] = await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.id, candidate.organizationId),
          isNull(organization.deletedAt),
        ),
      )
      .for("update");
    if (!activeOrg) return { kind: "organization-not-found" as const };

    const [invite] = await tx
      .select({
        id: invitation.id,
        organizationId: invitation.organizationId,
        email: invitation.email,
        role: invitation.role,
        inviterId: invitation.inviterId,
        teamId: invitation.teamId,
        projectId: invitation.projectId,
      })
      .from(invitation)
      .where(
        activeInvitationWhere(
          and(
            eq(invitation.id, input.invitationId),
            eq(invitation.status, "pending"),
            gt(invitation.expiresAt, new Date()),
          ),
        ),
      )
      .for("update");
    if (!invite) return { kind: "invitation-not-found" as const };
    if (invite.email.trim().toLowerCase() !== actorEmail.trim().toLowerCase())
      return { kind: "email-mismatch" as const };
    if (options.invitationType === "team" && !invite.teamId)
      return { kind: "wrong-type" as const };
    if (options.invitationType === "project" && !invite.projectId)
      return { kind: "wrong-type" as const };

    if (invite.teamId) {
      const [teamRow] = await tx
        .select({ id: team.id })
        .from(team)
        .where(
          and(
            eq(team.id, invite.teamId),
            eq(team.organizationId, invite.organizationId),
            isNull(team.deletedAt),
          ),
        )
        .limit(1)
        .for("update");
      if (!teamRow) return { kind: "team-not-found" as const };
    }
    if (invite.projectId) {
      const [projectRow] = await tx
        .select({ id: project.id })
        .from(project)
        .where(
          and(
            eq(project.id, invite.projectId),
            eq(project.organizationId, invite.organizationId),
            isNull(project.deletedAt),
          ),
        )
        .limit(1)
        .for("update");
      if (!projectRow) return { kind: "project-not-found" as const };
    }

    const [existingMember] = await tx
      .select({ id: member.id, suspendedAt: member.suspendedAt })
      .from(member)
      .where(
        and(
          eq(member.organizationId, invite.organizationId),
          eq(member.userId, ctx.userId),
          isNull(member.deletedAt),
        ),
      )
      .limit(1);
    if (existingMember?.suspendedAt)
      return { kind: "membership-suspended" as const };
    if (existingMember && !invite.projectId && !invite.teamId)
      return { kind: "membership-exists" as const };

    const memberId = existingMember?.id ?? crypto.randomUUID();
    if (!existingMember) {
      await tx.insert(member).values({
        id: memberId,
        organizationId: invite.organizationId,
        userId: ctx.userId,
        role: invite.role,
        invitedBy: invite.inviterId,
        joinedAt: new Date(),
      });
    }

    if (invite.teamId) {
      const [existingTeamMember] = await tx
        .select({ id: teamMember.id })
        .from(teamMember)
        .where(
          and(
            eq(teamMember.teamId, invite.teamId),
            eq(teamMember.userId, ctx.userId),
          ),
        )
        .limit(1);
      if (!existingTeamMember) {
        await tx.insert(teamMember).values({
          id: crypto.randomUUID(),
          teamId: invite.teamId,
          userId: ctx.userId,
          role: "member",
          addedBy: invite.inviterId,
          updatedAt: new Date(),
          updatedBy: invite.inviterId,
        });
        await tx
          .update(team)
          .set({ memberCount: sql`${team.memberCount} + 1` })
          .where(eq(team.id, invite.teamId));
      }
      await applyTeamProjectDefaults(tx, {
        organizationId: invite.organizationId,
        teamId: invite.teamId,
        userId: ctx.userId,
        actorUserId: ctx.userId,
        role: invite.role,
      });
    }

    if (invite.projectId) {
      const [existingGrant] = await tx
        .select({
          id: projectMemberGrant.id,
          grants: projectMemberGrant.grants,
        })
        .from(projectMemberGrant)
        .where(
          and(
            eq(projectMemberGrant.organizationId, invite.organizationId),
            eq(projectMemberGrant.projectId, invite.projectId),
            eq(projectMemberGrant.userId, ctx.userId),
            isNull(projectMemberGrant.deletedAt),
          ),
        )
        .limit(1)
        .for("update");
      const grants = mergeProjectMemberGrants(
        existingGrant?.grants ?? [],
        DEFAULT_TEAM_PROJECT_GRANTS,
      );
      if (existingGrant) {
        await tx
          .update(projectMemberGrant)
          .set({ grants, updatedBy: ctx.userId, updatedAt: new Date() })
          .where(eq(projectMemberGrant.id, existingGrant.id));
      } else {
        await tx.insert(projectMemberGrant).values({
          id: crypto.randomUUID(),
          organizationId: invite.organizationId,
          projectId: invite.projectId,
          userId: ctx.userId,
          grants,
          updatedBy: ctx.userId,
        });
      }
    }

    const [updatedInvite] = await tx
      .update(invitation)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
        acceptedBy: ctx.userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(invitation.id, invite.id),
          eq(invitation.organizationId, invite.organizationId),
          eq(invitation.status, "pending"),
        ),
      )
      .returning({ id: invitation.id });
    if (!updatedInvite) return { kind: "invitation-not-pending" as const };
    return {
      kind: "success" as const,
      memberId,
      organizationId: invite.organizationId,
    };
  });

  if (accepted.kind !== "success") {
    const messages = {
      "organization-not-found": "Organization not found.",
      "invitation-not-found": "Invitation not found.",
      "email-mismatch": "Invitation email does not match.",
      "wrong-type": "Invitation not found.",
      "membership-suspended": "Organization membership is suspended.",
      "membership-exists": "Organization membership already exists.",
      "team-not-found": "Team invitation not found.",
      "project-not-found": "Project invitation not found.",
      "invitation-not-pending": "Invitation is no longer pending.",
    } as const;
    return { kind: "failed", message: messages[accepted.kind] };
  }
  return {
    kind: "success",
    data: {
      memberId: accepted.memberId,
      organizationId: accepted.organizationId,
      invitationId: input.invitationId,
      status: "accepted",
    },
    message: "Invitation accepted.",
  };
}
