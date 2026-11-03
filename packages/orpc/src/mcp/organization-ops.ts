import type { WriteAuthAuditEventInput } from "@features/authentication/core/server/authentication.auth-audit-event";
import { writeAuthAuditEvent } from "@features/authentication/core/server/authentication.auth-audit-event";
import { writeAuditEvent } from "@features/authorization/core/server/authorization.audit-event-writer";
import type { ActionName } from "@features/authorization/utils";
import {
  activeInvitationWhere,
  activeMemberWhere,
  db,
  softDeleteSet,
} from "@loftlancer/drizzle";
import { assertOrganizationCanBeDeleted } from "@loftlancer/drizzle/org-delete-policy";
import { user } from "@loftlancer/drizzle/schema/auth";
import {
  invitation,
  member,
  memberOrganizationRole,
  organization,
  organizationRole,
  organizationRolePermission,
} from "@loftlancer/drizzle/schema/organization";
import {
  projectManager,
  projectMemberGrant,
} from "@loftlancer/drizzle/schema/project-access";
import { team, teamMember } from "@loftlancer/drizzle/schema/team";
import { isSoftDeletesEnabled } from "@loftlancer/t3-env/soft-deletes";
import { organizationInvitationAcceptController } from "@module/organizations/server/controller/server.organization-invitation-accept.controller";
import { createOrganizationInvitation } from "@module/organizations/server/service/server.invitation-create.service";
import { teamAvailableMembersController } from "@module/teams/server/controller/server.team-available-members.controller";
import { teamCreateController } from "@module/teams/server/controller/server.team-create.controller";
import { teamDeleteController } from "@module/teams/server/controller/server.team-delete.controller";
import { teamListController } from "@module/teams/server/controller/server.team-list.controller";
import { teamMemberAddController } from "@module/teams/server/controller/server.team-member-add.controller";
import { teamMemberRemoveController } from "@module/teams/server/controller/server.team-member-remove.controller";
import { teamMemberRoleChangeController } from "@module/teams/server/controller/server.team-member-role-change.controller";
import { teamMembersController } from "@module/teams/server/controller/server.team-members.controller";
import { teamRestoreController } from "@module/teams/server/controller/server.team-restore.controller";
import { teamUpdateController } from "@module/teams/server/controller/server.team-update.controller";
import {
  unwrapTeamList,
  unwrapTeamObject,
} from "@module/teams/server/handlers/server.legacy-response.handler";
import { transferOrganizationOwnership } from "@modules/organizations/server/service/server.organization-transfer-ownership.legacy";
import {
  getOwnerMutationBlockReason,
  isOwnerRole,
} from "@modules/organizations/utils/utils.member-removal-policy";
import { safeHttpUrlSchema } from "@modules/organizations/utils/validation/utils.organization-admin.validation";
import { and, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  type RequireActionContext,
  requireAction,
} from "../actions/require-action";
import { getMcpAuditContext } from "../mcp-audit-context";
import { resolveOrganizationIdForUser } from "./resolve-organization";

async function requireOrgAction(
  action: ActionName,
  ctx: RequireActionContext,
): Promise<void> {
  const mcp = getMcpAuditContext();
  await requireAction(action, {
    ...ctx,
    audit: mcp ? false : ctx.audit,
  });
}

async function recordMutationAudit(
  input: WriteAuthAuditEventInput,
): Promise<void> {
  if (getMcpAuditContext()) {
    await writeAuditEvent({
      action: input.action,
      result: input.result,
      actorUserId: input.actorUserId,
      organizationId: input.organizationId,
      projectId: input.projectId,
      entityId: input.entityId,
      targetUserId: input.targetUserId,
      denialReason: input.denialReason,
      payload: {
        ...input.payload,
        ...(input.entitySlug ? { entitySlug: input.entitySlug } : {}),
      },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
    return;
  }
  await writeAuthAuditEvent(input);
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
  await requireOrgAction("organization.create", { userId });
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

  await recordMutationAudit({
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
  await requireOrgAction(action, { userId, organizationId });
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
  await recordMutationAudit({
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
  await requireOrgAction("organization.delete", { userId, organizationId });
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
  await recordMutationAudit({
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
  await requireOrgAction("organization.restore", { userId, organizationId });
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
  await recordMutationAudit({
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
  await requireOrgAction("organization.view", { userId, organizationId });
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
  await requireOrgAction("organization.transfer_ownership", {
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
  await requireOrgAction("member.list", { userId, organizationId });
  const inviter = alias(user, "member_inviter");
  const updater = alias(user, "member_updater");
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
        updatedAt: member.updatedAt,
        updatedByName: updater.name,
        name: user.name,
        email: user.email,
        createdAt: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .leftJoin(inviter, eq(member.invitedBy, inviter.id))
      .leftJoin(updater, eq(member.updatedBy, updater.id))
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
  await requireOrgAction("member.suspend", {
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
              updatedAt: new Date(),
              updatedBy: userId,
            }
          : {
              suspendedAt: null,
              suspendedBy: null,
              suspensionReason: null,
              updatedAt: new Date(),
              updatedBy: userId,
            },
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
    await recordMutationAudit({
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
  if (!options?.alreadyAuthorized)
    await requireOrgAction("member.invite", { userId, organizationId });
  if (input.projectId && !options?.alreadyAuthorized)
    await requireOrgAction("project.permission.grant", {
      userId,
      organizationId,
      projectId: input.projectId,
    });
  if (input.teamId)
    await requireOrgAction("team.member.add", {
      userId,
      organizationId,
      teamId: input.teamId,
      audit: false,
    });
  const created = await createOrganizationInvitation(
    userId,
    organizationId,
    input,
  );
  if (options?.audit !== false)
    await recordMutationAudit({
      action: "member.invite",
      result: "success",
      actorUserId: userId,
      organizationId,
      entityId: created.id,
      payload: { invitationId: created.id, role: created.role },
    });
  return created;
}

export async function mcpMemberRemove(
  userId: string,
  organizationId: string,
  targetUserId: string,
  reason?: string,
) {
  await requireOrgAction("member.remove", {
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
        .set({
          ...softDeleteSet(userId),
          removalReason: reason?.trim().slice(0, 250) || null,
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(eq(member.id, target.id));
    } else {
      await tx.delete(member).where(eq(member.id, target.id));
    }
    return { memberId: target.id };
  });
  await recordMutationAudit({
    action: "member.remove",
    result: "success",
    actorUserId: userId,
    organizationId,
    entityId: removed.memberId,
    targetUserId,
    payload: reason?.trim()
      ? { removalReason: reason.trim().slice(0, 250) }
      : undefined,
  });
  return { success: true, userId: targetUserId };
}

export async function mcpMemberUpdateRole(
  userId: string,
  organizationId: string,
  targetUserId: string,
  role: string,
) {
  await requireOrgAction("member.role.update", {
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
      .set({ role, updatedAt: new Date(), updatedBy: userId })
      .where(eq(member.id, target.id))
      .returning({ id: member.id, userId: member.userId, role: member.role });
    if (!updated) throw new Error("member_not_found");
    return { member: updated, previousRole };
  });
  await recordMutationAudit({
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
  await requireOrgAction("member.list", { userId, organizationId });
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
  await requireOrgAction("invitation.cancel", { userId, organizationId });
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
  await recordMutationAudit({
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
    .select({ emailVerified: user.emailVerified })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const response = await organizationInvitationAcceptController({
    input: { invitationId },
    ctx: { userId, ip: null, userAgent: "loftlancer-mcp" },
    emailVerified: actor?.emailVerified ?? false,
  });
  if (
    response.status === "success" &&
    response.data &&
    !Array.isArray(response.data)
  )
    return response.data;
  throw new Error(response.message || "invitation_accept_failed");
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

  await requireOrgAction("invitation.reject", {
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
  await recordMutationAudit({
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
  return unwrapTeamList(
    await teamListController({ ctx: { userId, orgId: organizationId } }),
  );
}

export async function teamMembersList(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  return unwrapTeamList(
    await teamMembersController({
      ctx: { userId, orgId: organizationId },
      input: { teamId },
    }),
  );
}

export async function teamEligibleMembersList(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  return unwrapTeamList(
    await teamAvailableMembersController({
      ctx: { userId, orgId: organizationId },
      input: { teamId },
    }),
  );
}

export async function mcpTeamCreate(
  userId: string,
  organizationId: string,
  name: string,
  details: { description?: string | null; purpose?: string | null } = {},
) {
  return unwrapTeamObject(
    await teamCreateController({
      ctx: { userId, orgId: organizationId },
      input: {
        name,
        description: details.description ?? undefined,
        purpose: details.purpose ?? undefined,
      },
    }),
  );
}

export async function mcpTeamUpdate(
  userId: string,
  organizationId: string,
  teamId: string,
  name: string,
  details: { description?: string | null; purpose?: string | null } = {},
) {
  return unwrapTeamObject(
    await teamUpdateController({
      ctx: { userId, orgId: organizationId },
      input: {
        teamId,
        name,
        description: details.description,
        purpose: details.purpose,
      },
    }),
  );
}

export async function mcpTeamDelete(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  return unwrapTeamObject(
    await teamDeleteController({
      ctx: { userId, orgId: organizationId },
      input: { teamId },
    }),
  );
}

export async function mcpTeamRestore(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  return unwrapTeamObject(
    await teamRestoreController({
      ctx: { userId, orgId: organizationId },
      input: { teamId },
    }),
  );
}

export async function mcpTeamAddMember(
  userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
) {
  return unwrapTeamObject(
    await teamMemberAddController({
      ctx: { userId, orgId: organizationId },
      input: { teamId, userId: targetUserId },
    }),
  );
}

export async function mcpTeamRemoveMember(
  userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
) {
  return unwrapTeamObject(
    await teamMemberRemoveController({
      ctx: { userId, orgId: organizationId },
      input: { teamId, userId: targetUserId },
    }),
  );
}

export async function mcpTeamChangeMemberRole(
  userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
  role: "lead" | "member",
) {
  return unwrapTeamObject(
    await teamMemberRoleChangeController({
      ctx: { userId, orgId: organizationId },
      input: { teamId, userId: targetUserId, role },
    }),
  );
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
