import { sendOrganizationInvitationEmail } from "@features/authentication/core/server/authentication.organization-invitation-email";
import { canAssignOrganizationInviteRole } from "@features/authorization/utils";
import {
  activeInvitationWhere,
  activeMemberWhere,
  db,
} from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import {
  invitation,
  member,
  organization,
} from "@loftlancer/drizzle/schema/organization";
import { project } from "@loftlancer/drizzle/schema/projects";
import { team } from "@loftlancer/drizzle/schema/team";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
/** Shared persistence + delivery. Authorization and terminal audit belong to controllers. */
export async function createOrganizationInvitation(
  userId: string,
  organizationId: string,
  input: { email: string; role?: string; teamId?: string; projectId?: string },
) {
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error("invalid_invitation_email");
  const role = input.role ?? "member";
  if (input.projectId && role !== "member") {
    throw new Error("invalid_project_invitation_scope");
  }
  if (!["member", "manager", "owner"].includes(role)) {
    throw new Error("invalid_invitation_role");
  }

  const [org] = await db
    .select({ id: organization.id, name: organization.name })
    .from(organization)
    .where(
      and(eq(organization.id, organizationId), isNull(organization.deletedAt)),
    )
    .limit(1);
  const [inviter] = await db
    .select({ name: user.name, email: user.email, role: member.role })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(
      activeMemberWhere(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, userId),
          isNull(member.deletedAt),
        ),
      ),
    )
    .limit(1);
  if (!org || !inviter) throw new Error("organization_not_found");
  let projectName: string | undefined;
  if (input.projectId) {
    const [projectRow] = await db
      .select({ name: project.name })
      .from(project)
      .where(
        and(
          eq(project.id, input.projectId),
          eq(project.organizationId, organizationId),
          isNull(project.deletedAt),
        ),
      )
      .limit(1);
    if (!projectRow) throw new Error("invitation_project_not_found");
    projectName = projectRow.name;
  }
  if (
    !canAssignOrganizationInviteRole(
      inviter.role,
      role as "owner" | "manager" | "member",
    )
  ) {
    throw new Error("invitation_role_not_allowed");
  }

  const inviteId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.transaction(async (tx) => {
    const [lockedOrg] = await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.id, organizationId),
          isNull(organization.deletedAt),
        ),
      )
      .for("update");
    if (!lockedOrg) throw new Error("organization_not_found");

    if (input.teamId) {
      const [teamRow] = await tx
        .select({ id: team.id })
        .from(team)
        .where(
          and(
            eq(team.id, input.teamId),
            eq(team.organizationId, organizationId),
            isNull(team.deletedAt),
          ),
        )
        .for("update");
      if (!teamRow) throw new Error("invitation_team_not_found");
    }

    const [existingMember] = await tx
      .select({ id: member.id })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, organizationId),
            sql`lower(${user.email}) = ${email}`,
            isNull(member.deletedAt),
          ),
        ),
      )
      .limit(1);
    if (existingMember && !input.projectId) {
      throw new Error("invitation_email_is_already_a_member");
    }

    const [pendingInvite] = await tx
      .select({ id: invitation.id })
      .from(invitation)
      .where(
        activeInvitationWhere(
          and(
            eq(invitation.organizationId, organizationId),
            sql`lower(${invitation.email}) = ${email}`,
            eq(invitation.status, "pending"),
            gt(invitation.expiresAt, new Date()),
            input.projectId
              ? eq(invitation.projectId, input.projectId)
              : isNull(invitation.projectId),
          ),
        ),
      )
      .limit(1);
    if (pendingInvite) throw new Error("invitation_already_pending");

    await tx.insert(invitation).values({
      id: inviteId,
      organizationId,
      email,
      role,
      status: "pending",
      expiresAt,
      inviterId: userId,
      lastSentAt: new Date(),
      teamId: input.teamId ?? null,
      projectId: input.projectId ?? null,
    });
  });
  try {
    await sendOrganizationInvitationEmail({
      invitationId: inviteId,
      email,
      role,
      organizationId,
      inviterUserId: userId,
      organizationName: projectName
        ? `project ${projectName} in ${org.name}`
        : org.name,
      inviterName: inviter.name || inviter.email,
    });
  } catch (error) {
    await db
      .update(invitation)
      .set({
        status: "canceled",
        revokedAt: new Date(),
        revokedBy: userId,
        updatedAt: new Date(),
      })
      .where(
        and(eq(invitation.id, inviteId), eq(invitation.status, "pending")),
      );
    throw error;
  }
  return {
    id: inviteId,
    email,
    role,
    status: "pending",
  };
}
