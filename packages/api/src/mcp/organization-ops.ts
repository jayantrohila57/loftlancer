import {
  canAssignOrganizationInviteRole,
  DEFAULT_TEAM_PROJECT_GRANTS,
  mergeProjectMemberGrants,
} from "@loftlancer/actions";
import { writeAuthAuditEvent } from "@loftlancer/auth/audit-event";
import {
  getOwnerMutationBlockReason,
  isOwnerRole,
} from "@loftlancer/auth/member-removal-policy";
import { sendOrganizationInvitationEmail } from "@loftlancer/auth/organization-invitation-email";
import {
  activeInvitationWhere,
  activeMemberWhere,
  db,
  softDeleteSet,
} from "@loftlancer/db";
import { assertOrganizationCanBeDeleted } from "@loftlancer/db/org-delete-policy";
import { user } from "@loftlancer/db/schema/auth";
import {
  invitation,
  member,
  memberOrganizationRole,
  organization,
  organizationRole,
  organizationRolePermission,
} from "@loftlancer/db/schema/organization";
import {
  projectManager,
  projectMemberGrant,
  projectTeam,
} from "@loftlancer/db/schema/project-access";
import { project } from "@loftlancer/db/schema/projects";
import { team, teamMember } from "@loftlancer/db/schema/team";
import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import { and, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { requireAction } from "../actions/require-action";
import { transferOrganizationOwnership } from "../organization-ownership";
import { safeHttpUrlSchema } from "../organization-profile-validation";
import { resolveOrganizationIdForUser } from "./resolve-organization";

type OrganizationMutationTx = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

async function applyTeamProjectDefaults(
  tx: OrganizationMutationTx,
  input: {
    organizationId: string;
    teamId: string;
    userId: string;
    actorUserId: string;
    role: string;
  },
) {
  if (input.role !== "member") return;

  const linkedProjects = await tx
    .select({ projectId: projectTeam.projectId })
    .from(projectTeam)
    .where(
      and(
        eq(projectTeam.organizationId, input.organizationId),
        eq(projectTeam.teamId, input.teamId),
        isNull(projectTeam.deletedAt),
      ),
    )
    .orderBy(projectTeam.projectId);

  for (const { projectId } of linkedProjects) {
    const [existing] = await tx
      .select({
        id: projectMemberGrant.id,
        grants: projectMemberGrant.grants,
      })
      .from(projectMemberGrant)
      .where(
        and(
          eq(projectMemberGrant.organizationId, input.organizationId),
          eq(projectMemberGrant.projectId, projectId),
          eq(projectMemberGrant.userId, input.userId),
          isNull(projectMemberGrant.deletedAt),
        ),
      )
      .limit(1)
      .for("update");
    const grants = mergeProjectMemberGrants(
      existing?.grants ?? [],
      DEFAULT_TEAM_PROJECT_GRANTS,
    );

    if (existing) {
      await tx
        .update(projectMemberGrant)
        .set({
          grants,
          updatedBy: input.actorUserId,
          updatedAt: new Date(),
        })
        .where(eq(projectMemberGrant.id, existing.id));
    } else {
      await tx.insert(projectMemberGrant).values({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        projectId,
        userId: input.userId,
        grants,
        updatedBy: input.actorUserId,
      });
    }
  }
}

function slugifyOrganizationName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "organization";
}

async function ensureUniqueOrgSlug(base: string): Promise<string> {
  let slug = base;
  let suffix = 0;
  for (;;) {
    const [existing] = await db
      .select({ id: organization.id })
      .from(organization)
      .where(and(eq(organization.slug, slug), isNull(organization.deletedAt)))
      .limit(1);
    if (!existing) {
      return slug;
    }
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

export async function mcpOrganizationCreate(
  userId: string,
  input: { name: string; slug?: string },
) {
  await requireAction("organization.create", { userId });
  const name = input.name.trim();
  if (!name) {
    throw new Error("invalid_input: name");
  }
  const baseSlug = input.slug?.trim() || slugifyOrganizationName(name);
  const slug = await ensureUniqueOrgSlug(baseSlug);
  const orgId = crypto.randomUUID();
  const memberId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(organization).values({
      id: orgId,
      name,
      slug,
      metadata: JSON.stringify({ type: "team" }),
    });
    await tx.insert(member).values({
      id: memberId,
      organizationId: orgId,
      userId,
      role: "owner",
      joinedAt: new Date(),
    });
  });

  await writeAuthAuditEvent({
    action: "organization.create",
    result: "success",
    actorUserId: userId,
    organizationId: orgId,
    entityId: orgId,
    entitySlug: slug,
    payload: { name },
  });

  return { id: orgId, name, slug, role: "owner" };
}

export async function mcpOrganizationUpdate(
  userId: string,
  organizationId: string,
  input: { name?: string; logo?: string | null },
  action:
    | "organization.update"
    | "organization.settings.update" = "organization.update",
) {
  await requireAction(action, { userId, organizationId });
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name.trim();
  if (input.logo !== undefined) {
    const parsedLogo = safeHttpUrlSchema.nullable().safeParse(input.logo);
    if (!parsedLogo.success) throw new Error("invalid_organization_logo_url");
    update.logo = parsedLogo.data;
  }
  update.updatedAt = new Date();
  update.updatedBy = userId;

  const [row] = await db
    .update(organization)
    .set(update)
    .where(
      and(eq(organization.id, organizationId), isNull(organization.deletedAt)),
    )
    .returning({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    });

  if (!row) {
    throw new Error("organization_not_found");
  }
  await writeAuthAuditEvent({
    action: "organization.update",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: row.id,
    entitySlug: row.slug,
    payload: { name: row.name },
  });
  return row;
}

export async function mcpOrganizationDelete(
  userId: string,
  organizationId: string,
) {
  await requireAction("organization.delete", { userId, organizationId });
  const [org] = await db
    .select()
    .from(organization)
    .where(
      and(eq(organization.id, organizationId), isNull(organization.deletedAt)),
    )
    .limit(1);
  if (!org) {
    throw new Error("organization_not_found");
  }
  await assertOrganizationCanBeDeleted(org, userId);

  if (isSoftDeletesEnabled()) {
    await db
      .update(organization)
      .set(softDeleteSet(userId))
      .where(eq(organization.id, organizationId));
  } else {
    await db.delete(organization).where(eq(organization.id, organizationId));
  }
  await writeAuthAuditEvent({
    action: "organization.delete",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: org.id,
    entitySlug: org.slug,
    payload: { name: org.name },
  });
  return { success: true, organizationId };
}

export async function mcpOrganizationRestore(
  userId: string,
  organizationId: string,
) {
  await requireAction("organization.restore", { userId, organizationId });
  if (!isSoftDeletesEnabled()) {
    throw new Error("soft_deletes_disabled");
  }
  const [row] = await db
    .update(organization)
    .set({ deletedAt: null, deletedBy: null })
    .where(eq(organization.id, organizationId))
    .returning({ id: organization.id, slug: organization.slug });
  if (!row) {
    throw new Error("organization_not_found");
  }
  await writeAuthAuditEvent({
    action: "organization.restore",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: row.id,
    entitySlug: row.slug,
  });
  return row;
}

export async function mcpOrganizationView(
  userId: string,
  organizationId: string,
) {
  await requireAction("organization.view", { userId, organizationId });
  const [row] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      role: member.role,
    })
    .from(organization)
    .innerJoin(member, eq(member.organizationId, organization.id))
    .where(
      activeMemberWhere(
        and(
          eq(organization.id, organizationId),
          eq(member.userId, userId),
          isNull(organization.deletedAt),
        ),
      ),
    )
    .limit(1);
  if (!row) {
    throw new Error("organization_not_found");
  }
  return row;
}

export async function mcpOrganizationTransferOwnership(
  userId: string,
  organizationId: string,
  targetUserId: string,
) {
  await requireAction("organization.transfer_ownership", {
    userId,
    organizationId,
    targetUserId,
  });
  return transferOrganizationOwnership({
    actorUserId: userId,
    organizationId,
    targetUserId,
  });
}

export async function mcpMembersList(userId: string, organizationId: string) {
  await requireAction("member.list", { userId, organizationId });
  const inviter = alias(user, "member_inviter");
  const [rows, roleAssignments, rolePermissions] = await Promise.all([
    db
      .select({
        id: member.id,
        userId: member.userId,
        role: member.role,
        jobTitle: member.jobTitle,
        department: member.department,
        suspendedAt: member.suspendedAt,
        suspensionReason: member.suspensionReason,
        joinedAt: member.joinedAt,
        invitedBy: member.invitedBy,
        invitedByName: inviter.name,
        invitedByEmail: inviter.email,
        name: user.name,
        email: user.email,
        createdAt: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .leftJoin(inviter, eq(member.invitedBy, inviter.id))
      .where(
        and(
          eq(member.organizationId, organizationId),
          isNull(member.deletedAt),
        ),
      )
      .orderBy(member.createdAt),
    db
      .select({
        memberId: memberOrganizationRole.memberId,
        roleId: organizationRole.id,
        roleName: organizationRole.name,
        roleDescription: organizationRole.description,
      })
      .from(memberOrganizationRole)
      .innerJoin(
        organizationRole,
        and(
          eq(organizationRole.id, memberOrganizationRole.roleId),
          eq(
            organizationRole.organizationId,
            memberOrganizationRole.organizationId,
          ),
        ),
      )
      .where(eq(memberOrganizationRole.organizationId, organizationId)),
    db
      .select({
        roleId: organizationRolePermission.roleId,
        actionName: organizationRolePermission.actionName,
      })
      .from(organizationRolePermission)
      .where(eq(organizationRolePermission.organizationId, organizationId)),
  ]);
  return {
    items: rows.map((row) => {
      const role = roleAssignments.find(
        (assignment) => assignment.memberId === row.id,
      );
      return {
        ...row,
        access: {
          builtInRole: row.role,
          customRole: role
            ? {
                id: role.roleId,
                name: role.roleName,
                description: role.roleDescription,
                actions: rolePermissions
                  .filter((permission) => permission.roleId === role.roleId)
                  .map((permission) => permission.actionName),
              }
            : null,
        },
      };
    }),
  };
}

export async function mcpMemberSetSuspended(
  userId: string,
  organizationId: string,
  memberId: string,
  suspended: boolean,
  reason?: string,
) {
  await requireAction("member.suspend", {
    userId,
    organizationId,
    entityId: memberId,
    payload: { suspended },
  });
  const result = await db.transaction(async (tx) => {
    const [target] = await tx
      .select({
        id: member.id,
        role: member.role,
        suspendedAt: member.suspendedAt,
      })
      .from(member)
      .where(
        and(
          eq(member.id, memberId),
          eq(member.organizationId, organizationId),
          isNull(member.deletedAt),
        ),
      )
      .limit(1)
      .for("update");
    if (!target) throw new Error("member_not_found");
    if (isOwnerRole(target.role))
      throw new Error("organization_owner_cannot_be_suspended");
    if (Boolean(target.suspendedAt) === suspended) return { changed: false };
    await tx
      .update(member)
      .set(
        suspended
          ? {
              suspendedAt: new Date(),
              suspendedBy: userId,
              suspensionReason: reason?.trim() || null,
            }
          : { suspendedAt: null, suspendedBy: null, suspensionReason: null },
      )
      .where(
        and(
          eq(member.id, target.id),
          eq(member.organizationId, organizationId),
        ),
      );
    return { changed: true };
  });
  if (result.changed) {
    await writeAuthAuditEvent({
      action: "member.suspend",
      result: "success",
      actorUserId: userId,
      organizationId,
      entityId: memberId,
      payload: { suspended },
    });
  }
  return { success: true, changed: result.changed };
}

export async function mcpMemberInvite(
  userId: string,
  organizationId: string,
  input: { email: string; role?: string; teamId?: string; projectId?: string },
  options?: { alreadyAuthorized?: boolean; audit?: boolean },
) {
  if (!options?.alreadyAuthorized) {
    await requireAction("member.invite", { userId, organizationId });
  }
  if (input.projectId && !options?.alreadyAuthorized) {
    await requireAction("project.permission.grant", {
      userId,
      organizationId,
      projectId: input.projectId,
    });
  }
  if (input.teamId) {
    await requireAction("team.member.add", {
      userId,
      organizationId,
      teamId: input.teamId,
      audit: false,
    });
  }
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error("invalid_invitation_email");
  const role = input.role ?? "member";
  if (input.projectId && (input.teamId || role !== "member")) {
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
  if (options?.audit !== false) {
    await writeAuthAuditEvent({
      action: "member.invite",
      result: "success",
      actorUserId: userId,
      organizationId,
      entityId: inviteId,
      targetUserId: null,
      payload: { invitationId: inviteId, role },
    });
  }
  return {
    id: inviteId,
    email,
    role,
    status: "pending",
  };
}

export async function mcpMemberRemove(
  userId: string,
  organizationId: string,
  targetUserId: string,
) {
  await requireAction("member.remove", {
    userId,
    organizationId,
    targetUserId,
  });
  const removed = await db.transaction(async (tx) => {
    await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.id, organizationId),
          isNull(organization.deletedAt),
        ),
      )
      .for("update");
    const rows = await tx
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
    const target = rows.find((row) => row.userId === targetUserId);
    if (!target) throw new Error("member_not_found");
    const ownerCount = rows.filter((row) => isOwnerRole(row.role)).length;
    if (
      getOwnerMutationBlockReason({
        targetRole: target.role,
        activeOwnerCount: ownerCount,
        removing: true,
      })
    ) {
      throw new Error(
        "Transfer ownership first; the organization must have an owner.",
      );
    }
    const teamRows = await tx
      .select({ id: teamMember.id, teamId: teamMember.teamId })
      .from(teamMember)
      .innerJoin(team, eq(teamMember.teamId, team.id))
      .where(
        and(
          eq(team.organizationId, organizationId),
          eq(teamMember.userId, targetUserId),
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
      for (const row of teamRows) {
        counts.set(row.teamId, (counts.get(row.teamId) ?? 0) + 1);
      }
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
      eq(projectManager.userId, targetUserId),
      isNull(projectManager.deletedAt),
    );
    const grantScope = and(
      eq(projectMemberGrant.organizationId, organizationId),
      eq(projectMemberGrant.userId, targetUserId),
      isNull(projectMemberGrant.deletedAt),
    );
    if (isSoftDeletesEnabled()) {
      await tx
        .update(projectManager)
        .set(softDeleteSet(userId))
        .where(managerScope);
      await tx
        .update(projectMemberGrant)
        .set(softDeleteSet(userId))
        .where(grantScope);
    } else {
      await tx.delete(projectManager).where(managerScope);
      await tx.delete(projectMemberGrant).where(grantScope);
    }
    if (isSoftDeletesEnabled()) {
      await tx
        .update(member)
        .set(softDeleteSet(userId))
        .where(eq(member.id, target.id));
    } else {
      await tx.delete(member).where(eq(member.id, target.id));
    }
    return { memberId: target.id };
  });
  await writeAuthAuditEvent({
    action: "member.remove",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: removed.memberId,
    targetUserId,
  });
  return { success: true, userId: targetUserId };
}

export async function mcpMemberUpdateRole(
  userId: string,
  organizationId: string,
  targetUserId: string,
  role: string,
) {
  await requireAction("member.role.update", {
    userId,
    organizationId,
    targetUserId,
  });
  if (!["owner", "manager", "member"].includes(role)) {
    throw new Error("invalid_member_role");
  }
  const changed = await db.transaction(async (tx) => {
    await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.id, organizationId),
          isNull(organization.deletedAt),
        ),
      )
      .for("update");
    const rows = await tx
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
    const target = rows.find((row) => row.userId === targetUserId);
    if (!target) throw new Error("member_not_found");
    const previousRole = target.role;
    const ownerCount = rows.filter((row) => isOwnerRole(row.role)).length;
    if (
      getOwnerMutationBlockReason({
        targetRole: target.role,
        activeOwnerCount: ownerCount,
        nextRole: role,
      })
    ) {
      throw new Error(
        "Transfer ownership first; the organization must have an owner.",
      );
    }
    const [updated] = await tx
      .update(member)
      .set({ role })
      .where(eq(member.id, target.id))
      .returning({ id: member.id, userId: member.userId, role: member.role });
    if (!updated) throw new Error("member_not_found");
    return { member: updated, previousRole };
  });
  await writeAuthAuditEvent({
    action: "member.role.update",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: changed.member.id,
    targetUserId,
    payload: { previousRole: changed.previousRole, role: changed.member.role },
  });
  return changed.member;
}

export async function mcpInvitationsList(
  userId: string,
  organizationId: string,
) {
  await requireAction("member.list", { userId, organizationId });
  const rows = await db
    .select()
    .from(invitation)
    .where(activeInvitationWhere(eq(invitation.organizationId, organizationId)))
    .orderBy(invitation.createdAt);
  return { items: rows };
}

export async function mcpInvitationCancel(
  userId: string,
  organizationId: string,
  invitationId: string,
) {
  await requireAction("invitation.cancel", { userId, organizationId });
  const [row] = await db
    .update(invitation)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(invitation.id, invitationId),
        eq(invitation.organizationId, organizationId),
        eq(invitation.status, "pending"),
      ),
    )
    .returning({ id: invitation.id, status: invitation.status });
  if (!row) {
    throw new Error("invitation_not_found");
  }
  await writeAuthAuditEvent({
    action: "invitation.cancel",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: invitationId,
    payload: { invitationId },
  });
  return row;
}

export async function mcpInvitationAccept(
  userId: string,
  invitationId: string,
) {
  const [actor] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!actor?.email) throw new Error("invitation_email_mismatch");

  const [candidate] = await db
    .select({
      email: invitation.email,
      organizationId: invitation.organizationId,
    })
    .from(invitation)
    .where(
      activeInvitationWhere(
        and(
          eq(invitation.id, invitationId),
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, new Date()),
        ),
      ),
    )
    .limit(1);
  if (!candidate) throw new Error("invitation_not_found");
  if (
    actor.email.trim().toLowerCase() !== candidate.email.trim().toLowerCase()
  ) {
    throw new Error("invitation_email_mismatch");
  }
  await requireAction("invitation.accept", {
    userId,
    targetUserId: userId,
  });

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
    if (!activeOrg) throw new Error("organization_not_found");

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
            eq(invitation.id, invitationId),
            eq(invitation.status, "pending"),
            gt(invitation.expiresAt, new Date()),
          ),
        ),
      )
      .for("update");
    if (!invite) throw new Error("invitation_not_found");
    if (
      invite.email.trim().toLowerCase() !== actor.email?.trim().toLowerCase()
    ) {
      throw new Error("invitation_email_mismatch");
    }

    const [existingMember] = await tx
      .select({ id: member.id, suspendedAt: member.suspendedAt })
      .from(member)
      .where(
        and(
          eq(member.organizationId, invite.organizationId),
          eq(member.userId, userId),
          isNull(member.deletedAt),
        ),
      )
      .limit(1);
    if (existingMember?.suspendedAt)
      throw new Error("organization_membership_suspended");
    if (existingMember && !invite.projectId && !invite.teamId)
      throw new Error("organization_membership_already_exists");

    const memberId = existingMember?.id ?? crypto.randomUUID();
    if (!existingMember) {
      await tx.insert(member).values({
        id: memberId,
        organizationId: invite.organizationId,
        userId,
        role: invite.role,
        invitedBy: invite.inviterId,
        joinedAt: new Date(),
      });
    }

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
      if (!teamRow) throw new Error("invitation_team_not_found");
      const [existingTeamMember] = await tx
        .select({ id: teamMember.id })
        .from(teamMember)
        .where(
          and(
            eq(teamMember.teamId, invite.teamId),
            eq(teamMember.userId, userId),
          ),
        )
        .limit(1);
      if (!existingTeamMember) {
        await tx.insert(teamMember).values({
          id: crypto.randomUUID(),
          teamId: invite.teamId,
          userId,
          role: "member",
        });
        await tx
          .update(team)
          .set({ memberCount: sql`${team.memberCount} + 1` })
          .where(eq(team.id, invite.teamId));
      }
      await applyTeamProjectDefaults(tx, {
        organizationId: invite.organizationId,
        teamId: invite.teamId,
        userId,
        actorUserId: userId,
        role: invite.role,
      });
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
      if (!projectRow) throw new Error("invitation_project_not_found");
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
            eq(projectMemberGrant.userId, userId),
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
          .set({ grants, updatedBy: userId, updatedAt: new Date() })
          .where(eq(projectMemberGrant.id, existingGrant.id));
      } else {
        await tx.insert(projectMemberGrant).values({
          id: crypto.randomUUID(),
          organizationId: invite.organizationId,
          projectId: invite.projectId,
          userId,
          grants,
          updatedBy: userId,
        });
      }
    }

    const [updatedInvite] = await tx
      .update(invitation)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
        acceptedBy: userId,
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
    if (!updatedInvite) throw new Error("invitation_not_pending");
    return { memberId, organizationId: invite.organizationId };
  });

  await writeAuthAuditEvent({
    action: "invitation.accept",
    result: "success",
    actorUserId: userId,
    organizationId: accepted.organizationId,
    entityId: invitationId,
    targetUserId: userId,
    payload: { invitationId },
  });
  return {
    ...accepted,
    invitationId,
    status: "accepted",
  };
}

export async function mcpInvitationReject(
  userId: string,
  invitationId: string,
) {
  const [invite] = await db
    .select()
    .from(invitation)
    .where(
      activeInvitationWhere(
        and(
          eq(invitation.id, invitationId),
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, new Date()),
        ),
      ),
    )
    .limit(1);
  if (!invite) {
    throw new Error("invitation_not_found");
  }

  const [actor] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (
    !actor?.email ||
    actor.email.trim().toLowerCase() !== invite.email.trim().toLowerCase()
  ) {
    throw new Error("invitation_email_mismatch");
  }

  await requireAction("invitation.reject", {
    userId,
    targetUserId: userId,
  });

  const [rejected] = await db
    .update(invitation)
    .set({
      status: "rejected",
      rejectedAt: new Date(),
      rejectedBy: userId,
      updatedAt: new Date(),
    })
    .where(
      activeInvitationWhere(
        and(
          eq(invitation.id, invitationId),
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, new Date()),
        ),
      ),
    )
    .returning({
      id: invitation.id,
      organizationId: invitation.organizationId,
    });
  if (!rejected) throw new Error("invitation_not_pending");
  await writeAuthAuditEvent({
    action: "invitation.reject",
    result: "success",
    actorUserId: userId,
    organizationId: rejected.organizationId,
    entityId: invitationId,
    targetUserId: userId,
    payload: { invitationId },
  });
  return { invitationId, status: "rejected" };
}

export async function mcpTeamsList(userId: string, organizationId: string) {
  await requireAction("member.list", { userId, organizationId });
  const rows = await db
    .select()
    .from(team)
    .where(and(eq(team.organizationId, organizationId), isNull(team.deletedAt)))
    .orderBy(team.name);
  return { items: rows };
}

export async function teamMembersList(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  await requireAction("team.member.list", { userId, organizationId, teamId });
  const [row] = await db
    .select({ id: team.id })
    .from(team)
    .where(
      and(
        eq(team.id, teamId),
        eq(team.organizationId, organizationId),
        isNull(team.deletedAt),
      ),
    )
    .limit(1);
  if (!row) {
    throw new Error("Team not found");
  }
  const rows = await db
    .select({
      id: teamMember.id,
      userId: teamMember.userId,
      teamId: teamMember.teamId,
      role: teamMember.role,
      name: user.name,
      email: user.email,
    })
    .from(teamMember)
    .innerJoin(
      member,
      and(
        eq(member.userId, teamMember.userId),
        eq(member.organizationId, organizationId),
        isNull(member.deletedAt),
      ),
    )
    .innerJoin(user, eq(user.id, teamMember.userId))
    .where(eq(teamMember.teamId, teamId));
  return { items: rows };
}

export async function teamEligibleMembersList(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  await requireAction("team.member.add", {
    userId,
    organizationId,
    teamId,
    audit: false,
  });
  const [teamRow] = await db
    .select({ id: team.id })
    .from(team)
    .where(
      and(
        eq(team.id, teamId),
        eq(team.organizationId, organizationId),
        isNull(team.deletedAt),
      ),
    )
    .limit(1);
  if (!teamRow) throw new Error("Team not found");
  const rows = await db
    .select({ userId: member.userId, name: user.name, email: user.email })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .leftJoin(
      teamMember,
      and(eq(teamMember.teamId, teamId), eq(teamMember.userId, member.userId)),
    )
    .where(
      and(
        eq(member.organizationId, organizationId),
        isNull(member.deletedAt),
        isNull(teamMember.id),
      ),
    )
    .orderBy(user.name);
  return { items: rows };
}

export async function mcpTeamCreate(
  userId: string,
  organizationId: string,
  name: string,
) {
  await requireAction("team.create", { userId, organizationId });
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error("invalid_team_name");
  const teamId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(team).values({
      id: teamId,
      name: normalizedName,
      organizationId,
      memberCount: 1,
    });
    await tx.insert(teamMember).values({
      id: crypto.randomUUID(),
      teamId,
      userId,
      role: "lead",
    });
  });
  await writeAuthAuditEvent({
    action: "team.create",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: teamId,
    payload: { name: normalizedName },
  });
  return { id: teamId, name: normalizedName, organizationId };
}

export async function mcpTeamUpdate(
  userId: string,
  organizationId: string,
  teamId: string,
  name: string,
) {
  await requireAction("team.update", { userId, organizationId });
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error("invalid_team_name");
  const [row] = await db
    .update(team)
    .set({ name: normalizedName, updatedAt: new Date() })
    .where(
      and(
        eq(team.id, teamId),
        eq(team.organizationId, organizationId),
        isNull(team.deletedAt),
      ),
    )
    .returning({ id: team.id, name: team.name });
  if (!row) {
    throw new Error("team_not_found");
  }
  await writeAuthAuditEvent({
    action: "team.update",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: teamId,
    payload: { name: normalizedName },
  });
  return row;
}

export async function mcpTeamDelete(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  await requireAction("team.delete", { userId, organizationId });
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
  await writeAuthAuditEvent({
    action: "team.delete",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: teamId,
  });
  return { success: true, teamId };
}

export async function mcpTeamRestore(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  await requireAction("team.restore", { userId, organizationId });
  if (!isSoftDeletesEnabled()) {
    throw new Error("soft_deletes_disabled");
  }
  const [row] = await db
    .update(team)
    .set({ deletedAt: null, deletedBy: null })
    .where(and(eq(team.id, teamId), eq(team.organizationId, organizationId)))
    .returning({ id: team.id, name: team.name });
  if (!row) {
    throw new Error("team_not_found");
  }
  await writeAuthAuditEvent({
    action: "team.restore",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: teamId,
  });
  return row;
}

export async function mcpTeamAddMember(
  userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
) {
  await requireAction("team.member.add", { userId, organizationId, teamId });
  await db.transaction(async (tx) => {
    const [activeMember] = await tx
      .select({ id: member.id, role: member.role })
      .from(member)
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, targetUserId),
          ),
        ),
      )
      .limit(1)
      .for("update");
    if (!activeMember) throw new Error("organization_member_not_found");
    const [teamRow] = await tx
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
    if (!teamRow) throw new Error("team_not_found");
    const [existing] = await tx
      .select({ id: teamMember.id })
      .from(teamMember)
      .where(
        and(eq(teamMember.teamId, teamId), eq(teamMember.userId, targetUserId)),
      )
      .limit(1);
    if (!existing) {
      await tx.insert(teamMember).values({
        id: crypto.randomUUID(),
        teamId,
        userId: targetUserId,
      });
    }
    await applyTeamProjectDefaults(tx, {
      organizationId,
      teamId,
      userId: targetUserId,
      actorUserId: userId,
      role: activeMember.role,
    });
    const [count] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(teamMember)
      .where(eq(teamMember.teamId, teamId));
    await tx
      .update(team)
      .set({ memberCount: count?.count ?? 0 })
      .where(eq(team.id, teamId));
  });
  await writeAuthAuditEvent({
    action: "team.member.add",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: teamId,
    targetUserId,
  });
  return { teamId, userId: targetUserId };
}

export async function mcpTeamRemoveMember(
  userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
) {
  await requireAction("team.member.remove", { userId, organizationId, teamId });
  await db.transaction(async (tx) => {
    const [teamRow] = await tx
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
    if (!teamRow) throw new Error("team_not_found");
    const [target] = await tx
      .select({ role: teamMember.role })
      .from(teamMember)
      .where(
        and(eq(teamMember.teamId, teamId), eq(teamMember.userId, targetUserId)),
      )
      .limit(1);
    if (target?.role === "lead") {
      const [leadCount] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.role, "lead")));
      if ((leadCount?.count ?? 0) <= 1) {
        throw new Error("team_requires_lead");
      }
    }
    await tx
      .delete(teamMember)
      .where(
        and(eq(teamMember.teamId, teamId), eq(teamMember.userId, targetUserId)),
      );
    const [count] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(teamMember)
      .where(eq(teamMember.teamId, teamId));
    await tx
      .update(team)
      .set({ memberCount: count?.count ?? 0 })
      .where(eq(team.id, teamId));
  });
  await writeAuthAuditEvent({
    action: "team.member.remove",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: teamId,
    targetUserId,
  });
  return { teamId, userId: targetUserId };
}

export async function mcpTeamChangeMemberRole(
  userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
  role: "lead" | "member",
) {
  await requireAction("team.member.role.change", {
    userId,
    organizationId,
    teamId,
  });
  await db.transaction(async (tx) => {
    const [teamRow] = await tx
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
    if (!teamRow) throw new Error("team_not_found");
    const [targetMember] = await tx
      .select({ id: member.id })
      .from(member)
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, targetUserId),
          ),
        ),
      )
      .limit(1);
    if (!targetMember) throw new Error("organization_member_not_found");
    const [row] = await tx
      .select({ membershipId: teamMember.id, role: teamMember.role })
      .from(teamMember)
      .where(
        and(eq(teamMember.teamId, teamId), eq(teamMember.userId, targetUserId)),
      )
      .limit(1);
    if (!row) throw new Error("team_member_not_found");
    if (row.role === "lead" && role === "member") {
      const [leadCount] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.role, "lead")));
      if ((leadCount?.count ?? 0) <= 1) {
        throw new Error("team_requires_lead");
      }
    }
    await tx
      .update(teamMember)
      .set({ role })
      .where(eq(teamMember.id, row.membershipId));
  });
  await writeAuthAuditEvent({
    action: "team.member.role.change",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: teamId,
    targetUserId,
    payload: { role },
  });
  return { teamId, userId: targetUserId, role };
}

export async function resolveOrgFromInput(
  userId: string,
  input: { organizationId?: string; organizationSlug?: string },
): Promise<string | null> {
  if (!input.organizationId && !input.organizationSlug) {
    return null;
  }
  return resolveOrganizationIdForUser(userId, input);
}
