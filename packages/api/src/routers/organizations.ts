import { randomBytes, randomUUID } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { isActionsAuditEnabled, normalizeOrgRole } from "@loftlancer/actions";
import { sendOrganizationInvitationEmail } from "@loftlancer/auth/organization-invitation-email";
import { activeMemberWhere, db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import {
  invitation,
  member,
  memberOrganizationRole,
  organization,
  organizationDomain,
  organizationProfile,
  organizationRole,
  organizationRolePermission,
  organizationSettings,
} from "@loftlancer/db/schema/organization";
import { projectTeam } from "@loftlancer/db/schema/project-access";
import { project } from "@loftlancer/db/schema/projects";
import { team } from "@loftlancer/db/schema/team";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gt, isNull, lte, type SQL, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { isDelegableOrganizationAction } from "../actions/custom-role-permissions";
import { requireAction } from "../actions/require-action";
import {
  orgAwareProcedure,
  orgProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../index";
import { getPublicInvitationStatus } from "../invitation-preview";
import {
  mcpInvitationAccept,
  mcpMemberInvite,
  mcpMemberRemove,
  mcpMembersList,
} from "../mcp/organization-ops";
import { loadMemberAccessSummary } from "../member-access/service";
import { organizationBrandingLogoSchema } from "../organization-branding-validation";
import {
  domainChallengeMatches,
  hashDomainChallenge,
  normalizeOrganizationEmailDomain,
} from "../organization-domain-verification";
import { transferOrganizationOwnership } from "../organization-ownership";
import { organizationProfilePatchSchema } from "../organization-profile-validation";
import { organizationSettingsPatchSchema } from "../organization-settings-validation";

async function requireOrganizationOwner(
  userId: string,
  organizationId: string,
) {
  const [membership] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, organizationId),
        eq(member.userId, userId),
        isNull(member.deletedAt),
      ),
    )
    .limit(1);
  if (normalizeOrgRole(membership?.role) !== "owner")
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Only organization owners can manage organization roles and domains.",
    });
}

export const organizationsRouter = router({
  updateMemberProfile: orgProcedure
    .input(
      z.object({
        memberId: z.string().min(1),
        jobTitle: z.string().trim().max(100).nullable(),
        department: z.string().trim().max(100).nullable(),
      }),
    )
    .use(
      actionGuard("member.profile.update", (input) => {
        const profile = input as {
          memberId: string;
          jobTitle: string | null;
          department: string | null;
        };
        return {
          entityId: profile.memberId,
          payload: { fields: ["jobTitle", "department"] },
        };
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      const [updated] = await db
        .update(member)
        .set({
          jobTitle: input.jobTitle || null,
          department: input.department || null,
          updatedAt: new Date(),
          updatedBy: ctx.session.user.id,
        })
        .where(
          and(
            eq(member.id, input.memberId),
            eq(member.organizationId, organizationId),
            isNull(member.deletedAt),
            isNull(member.suspendedAt),
          ),
        )
        .returning({ id: member.id });
      if (!updated)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Active organization member not found.",
        });
      return { success: true };
    }),

  setMemberSuspended: orgProcedure
    .input(
      z.object({
        memberId: z.string().min(1),
        suspended: z.boolean(),
        reason: z.string().trim().max(250).optional(),
      }),
    )
    .use(
      actionGuard("member.suspend", (input) => {
        const target = input as { memberId: string; suspended: boolean };
        return {
          entityId: target.memberId,
          payload: { suspended: target.suspended },
        };
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
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
            eq(member.organizationId, organizationId),
            isNull(member.deletedAt),
          ),
        )
        .limit(1);
      if (!target)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization member not found.",
        });
      if (normalizeOrgRole(target.role) === "owner")
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Transfer ownership before changing an owner's access.",
        });
      if (input.suspended === Boolean(target.suspendedAt))
        return { success: true };
      await db
        .update(member)
        .set(
          input.suspended
            ? {
                suspendedAt: new Date(),
                suspendedBy: ctx.session.user.id,
                suspensionReason: input.reason || null,
                updatedAt: new Date(),
                updatedBy: ctx.session.user.id,
              }
            : {
                suspendedAt: null,
                suspendedBy: null,
                suspensionReason: null,
                updatedAt: new Date(),
                updatedBy: ctx.session.user.id,
              },
        )
        .where(
          and(
            eq(member.id, target.id),
            eq(member.organizationId, organizationId),
            isNull(member.deletedAt),
          ),
        );
      return { success: true };
    }),

  listCustomRoles: orgProcedure
    .use(actionGuard("member.list"))
    .query(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      const [roles, assignments] = await Promise.all([
        db
          .select({
            id: organizationRole.id,
            name: organizationRole.name,
            description: organizationRole.description,
            createdAt: organizationRole.createdAt,
          })
          .from(organizationRole)
          .where(eq(organizationRole.organizationId, organizationId))
          .orderBy(organizationRole.name),
        db
          .select({
            memberId: memberOrganizationRole.memberId,
            roleId: memberOrganizationRole.roleId,
          })
          .from(memberOrganizationRole)
          .innerJoin(
            member,
            and(
              eq(member.id, memberOrganizationRole.memberId),
              eq(member.organizationId, memberOrganizationRole.organizationId),
            ),
          )
          .where(
            and(
              eq(memberOrganizationRole.organizationId, organizationId),
              isNull(member.deletedAt),
            ),
          ),
      ]);
      const permissions = await db
        .select({
          roleId: organizationRolePermission.roleId,
          action: organizationRolePermission.actionName,
        })
        .from(organizationRolePermission)
        .where(eq(organizationRolePermission.organizationId, organizationId));
      return roles.map((role) => ({
        ...role,
        actions: permissions
          .filter((p) => p.roleId === role.id)
          .map((p) => p.action),
        memberIds: assignments
          .filter((a) => a.roleId === role.id)
          .map((a) => a.memberId),
      }));
    }),

  createCustomRole: orgProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(60),
        description: z.string().trim().max(240).optional(),
        actions: z.array(z.string()).max(40),
      }),
    )
    .use(
      actionGuard("organization.role.create", (input) => {
        const role = input as { name: string; actions: string[] };
        return {
          payload: {
            fields: ["name", "description", "permissions"],
            permissionCount: role.actions.length,
          },
        };
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      await requireOrganizationOwner(ctx.session.user.id, organizationId);
      const actions = [...new Set(input.actions)];
      if (actions.some((action) => !isDelegableOrganizationAction(action)))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "One or more selected permissions cannot be assigned to a custom role.",
        });
      const id = randomUUID();
      try {
        await db.transaction(async (tx) => {
          await tx.insert(organizationRole).values({
            id,
            organizationId,
            name: input.name,
            description: input.description || null,
            createdBy: ctx.session.user.id,
          });
          if (actions.length)
            await tx.insert(organizationRolePermission).values(
              actions.map((actionName) => ({
                id: randomUUID(),
                organizationId,
                roleId: id,
                actionName,
              })),
            );
        });
      } catch (error) {
        if ((error as { code?: string }).code === "23505")
          throw new TRPCError({
            code: "CONFLICT",
            message: "A role with this name already exists.",
          });
        throw error;
      }
      return { id };
    }),

  assignCustomRole: orgProcedure
    .input(
      z.object({
        memberId: z.string().min(1),
        roleId: z.string().min(1).nullable(),
      }),
    )
    .use(
      actionGuard("organization.role.assign", (input) => {
        const target = input as { memberId: string; roleId: string | null };
        return {
          entityId: target.memberId,
          payload: { roleId: target.roleId },
        };
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      await requireOrganizationOwner(ctx.session.user.id, organizationId);
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
            eq(member.organizationId, organizationId),
            isNull(member.deletedAt),
          ),
        )
        .limit(1);
      if (
        !target ||
        target.suspendedAt ||
        normalizeOrgRole(target.role) !== "member"
      )
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Custom roles can only be assigned to active Members.",
        });
      if (input.roleId) {
        const [role] = await db
          .select({ id: organizationRole.id })
          .from(organizationRole)
          .where(
            and(
              eq(organizationRole.id, input.roleId),
              eq(organizationRole.organizationId, organizationId),
            ),
          )
          .limit(1);
        if (!role)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization role not found.",
          });
        await db
          .insert(memberOrganizationRole)
          .values({
            id: randomUUID(),
            organizationId,
            memberId: target.id,
            roleId: role.id,
            assignedBy: ctx.session.user.id,
          })
          .onConflictDoUpdate({
            target: [
              memberOrganizationRole.organizationId,
              memberOrganizationRole.memberId,
            ],
            set: {
              roleId: role.id,
              assignedBy: ctx.session.user.id,
              assignedAt: new Date(),
            },
          });
      } else {
        await db
          .delete(memberOrganizationRole)
          .where(
            and(
              eq(memberOrganizationRole.organizationId, organizationId),
              eq(memberOrganizationRole.memberId, target.id),
            ),
          );
      }
      return { success: true };
    }),

  updateCustomRole: orgProcedure
    .input(
      z.object({
        roleId: z.string().min(1),
        name: z.string().trim().min(2).max(60),
        description: z.string().trim().max(240).optional(),
        actions: z.array(z.string()).max(40),
      }),
    )
    .use(
      actionGuard("organization.role.update", (input) => {
        const role = input as { roleId: string; actions: string[] };
        return {
          entityId: role.roleId,
          payload: {
            fields: ["name", "description", "permissions"],
            permissionCount: role.actions.length,
          },
        };
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      await requireOrganizationOwner(ctx.session.user.id, organizationId);
      const actions = [...new Set(input.actions)];
      if (actions.some((action) => !isDelegableOrganizationAction(action)))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "One or more selected permissions cannot be assigned to a custom role.",
        });
      try {
        await db.transaction(async (tx) => {
          const [updated] = await tx
            .update(organizationRole)
            .set({
              name: input.name,
              description: input.description || null,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(organizationRole.id, input.roleId),
                eq(organizationRole.organizationId, organizationId),
              ),
            )
            .returning({ id: organizationRole.id });
          if (!updated)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Organization role not found.",
            });
          await tx
            .delete(organizationRolePermission)
            .where(
              and(
                eq(organizationRolePermission.roleId, updated.id),
                eq(organizationRolePermission.organizationId, organizationId),
              ),
            );
          if (actions.length)
            await tx.insert(organizationRolePermission).values(
              actions.map((actionName) => ({
                id: randomUUID(),
                organizationId,
                roleId: updated.id,
                actionName,
              })),
            );
        });
      } catch (error) {
        if ((error as { code?: string }).code === "23505")
          throw new TRPCError({
            code: "CONFLICT",
            message: "A role with this name already exists.",
          });
        throw error;
      }
      return { success: true };
    }),

  deleteCustomRole: orgProcedure
    .input(z.object({ roleId: z.string().min(1) }))
    .use(
      actionGuard("organization.role.delete", (input) => ({
        entityId: (input as { roleId: string }).roleId,
        payload: { operation: "delete" },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      await requireOrganizationOwner(ctx.session.user.id, organizationId);
      await db
        .delete(organizationRole)
        .where(
          and(
            eq(organizationRole.id, input.roleId),
            eq(organizationRole.organizationId, organizationId),
          ),
        );
      return { success: true };
    }),

  transferOwnership: orgProcedure
    .input(z.object({ targetUserId: z.string().min(1) }))
    .use(actionGuard("organization.transfer_ownership"))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      return transferOrganizationOwnership({
        actorUserId: ctx.session.user.id,
        organizationId,
        targetUserId: input.targetUserId,
      });
    }),

  /**
   * Public invitation landing preview. The invite ID is a random bearer link;
   * never return the recipient email or any other account data here.
   */
  getInvitationPreview: publicProcedure
    .input(z.object({ invitationId: z.string().min(1).max(200) }))
    .query(async ({ input }) => {
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

      if (!row) return { status: "not_found" as const };
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
      return {
        status:
          (row.projectId && row.projectDeletedAt) ||
          (row.teamId && !row.teamName)
            ? ("unavailable" as const)
            : getPublicInvitationStatus({
                status: row.status,
                expiresAt: row.expiresAt,
                deletedAt: row.invitationDeletedAt,
                organizationDeletedAt: row.organizationDeletedAt,
                teamDeletedAt: row.teamDeletedAt,
              }),
        organizationName: row.organizationName,
        organizationSlug: row.organizationSlug,
        role: row.role,
        inviterName: row.inviterName,
        projectId: row.projectId,
        projectName: row.projectName,
        projectSlug: row.projectSlug,
        teamId: row.teamId,
        teamName: row.teamName,
        invitedTeamRole: row.teamId ? ("member" as const) : null,
        linkedProjects,
      };
    }),

  acceptTeamInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.emailVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Verify your email before accepting this invitation.",
        });
      }
      const [row] = await db
        .select({ teamId: invitation.teamId })
        .from(invitation)
        .where(eq(invitation.id, input.invitationId))
        .limit(1);
      if (!row?.teamId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team invitation not found",
        });
      }
      return mcpInvitationAccept(ctx.session.user.id, input.invitationId);
    }),

  acceptProjectInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.emailVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Verify your email before accepting this invitation.",
        });
      }
      const [row] = await db
        .select({ projectId: invitation.projectId })
        .from(invitation)
        .where(eq(invitation.id, input.invitationId))
        .limit(1);
      if (!row?.projectId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project invitation not found",
        });
      }
      return mcpInvitationAccept(ctx.session.user.id, input.invitationId);
    }),

  inviteToProject: orgProcedure
    .input(
      z.object({ projectId: z.string().min(1), email: z.string().email() }),
    )
    .use(
      actionGuard("project.permission.grant", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active organization",
        });
      }
      return mcpMemberInvite(ctx.session.user.id, organizationId, {
        email: input.email,
        role: "member",
        projectId: input.projectId,
      });
    }),

  listProjectInvitations: orgProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        status: z
          .enum([
            "all",
            "pending",
            "expired",
            "accepted",
            "rejected",
            "canceled",
          ])
          .default("pending"),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .use(
      actionGuard("project.read", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) return { items: [], total: 0 };
      await requireAction("member.list", {
        userId: ctx.session.user.id,
        organizationId,
        audit: false,
      });
      const scope = and(
        eq(invitation.organizationId, organizationId),
        eq(invitation.projectId, input.projectId),
        isNull(invitation.deletedAt),
      );
      const now = new Date();
      const byStatus: Record<string, SQL | undefined> = {
        all: scope,
        pending: and(
          scope,
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, now),
        ),
        expired: and(
          scope,
          eq(invitation.status, "pending"),
          lte(invitation.expiresAt, now),
        ),
        accepted: and(scope, eq(invitation.status, "accepted")),
        rejected: and(scope, eq(invitation.status, "rejected")),
        canceled: and(scope, eq(invitation.status, "canceled")),
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
          .where(where),
      ]);
      return { items, total: counts[0]?.total ?? 0 };
    }),

  cancelProjectInvitation: orgProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        invitationId: z.string().min(1),
      }),
    )
    .use(
      actionGuard("project.permission.grant", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active organization",
        });
      }
      const [row] = await db
        .update(invitation)
        .set({
          status: "canceled",
          revokedAt: new Date(),
          revokedBy: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(invitation.id, input.invitationId),
            eq(invitation.organizationId, organizationId),
            eq(invitation.projectId, input.projectId),
            eq(invitation.status, "pending"),
          ),
        )
        .returning({ id: invitation.id });
      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pending invitation not found",
        });
      return { ok: true };
    }),

  resendProjectInvitation: orgProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        invitationId: z.string().min(1),
      }),
    )
    .use(
      actionGuard("project.permission.grant", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active organization",
        });
      }
      await requireAction("member.invite", {
        userId: ctx.session.user.id,
        organizationId,
        audit: false,
      });
      const [row] = await db
        .select({
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          projectName: project.name,
          organizationName: organization.name,
        })
        .from(invitation)
        .innerJoin(project, eq(invitation.projectId, project.id))
        .innerJoin(organization, eq(invitation.organizationId, organization.id))
        .where(
          and(
            eq(invitation.id, input.invitationId),
            eq(invitation.projectId, input.projectId),
            eq(invitation.organizationId, organizationId),
            eq(invitation.status, "pending"),
            isNull(invitation.deletedAt),
            isNull(project.deletedAt),
            isNull(organization.deletedAt),
          ),
        )
        .limit(1);
      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pending invitation not found",
        });
      await db
        .update(invitation)
        .set({ expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
        .where(eq(invitation.id, row.id));
      await sendOrganizationInvitationEmail({
        invitationId: row.id,
        email: row.email,
        role: row.role,
        organizationName: `project ${row.projectName} in ${row.organizationName}`,
        inviterName: ctx.session.user.name || ctx.session.user.email,
      });
      return { ok: true };
    }),

  /** Invitations addressed to the signed-in, verified email account. */
  listMyInvitations: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = ctx.session.user;
    if (!currentUser.emailVerified) return { items: [] };

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
          sql`lower(${invitation.email}) = lower(${currentUser.email})`,
          eq(invitation.status, "pending"),
          isNull(invitation.deletedAt),
          isNull(organization.deletedAt),
          gt(invitation.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(invitation.createdAt));

    return { items: rows };
  }),

  resendInvitation: orgProcedure
    .input(z.object({ invitationId: z.string().min(1) }))
    .use(
      actionGuard("member.invite", (input) => ({
        entityId: (input as { invitationId: string }).invitationId,
        payload: { operation: "resend" },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      const [row] = await db
        .select({
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          organizationName: organization.name,
        })
        .from(invitation)
        .innerJoin(organization, eq(organization.id, invitation.organizationId))
        .where(
          and(
            eq(invitation.id, input.invitationId),
            eq(invitation.organizationId, organizationId),
            eq(invitation.status, "pending"),
            isNull(invitation.deletedAt),
            isNull(organization.deletedAt),
          ),
        )
        .limit(1);
      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pending invitation not found.",
        });
      const now = new Date();
      await sendOrganizationInvitationEmail({
        invitationId: row.id,
        email: row.email,
        role: row.role,
        organizationName: row.organizationName,
        inviterName: ctx.session.user.name || ctx.session.user.email,
      });
      await db
        .update(invitation)
        .set({
          lastSentAt: now,
          updatedAt: now,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        })
        .where(
          and(
            eq(invitation.id, row.id),
            eq(invitation.organizationId, organizationId),
            eq(invitation.status, "pending"),
          ),
        );
      return { success: true };
    }),

  createInvitation: orgProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        email: z.string().email(),
        role: z.enum(["owner", "manager", "member"]).default("member"),
        teamId: z.string().min(1).optional(),
      }),
    )
    .use(
      actionGuard("member.invite", (input) => {
        const invite = input as { role: string; teamId?: string };
        return {
          payload: {
            role: invite.role,
            scope: invite.teamId ? "team" : "organization",
          },
        };
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId || organizationId !== input.organizationId)
        throw new TRPCError({
          code: organizationId ? "FORBIDDEN" : "BAD_REQUEST",
          message: organizationId
            ? "The active organization changed. Reload and try again."
            : "Select an organization first.",
        });
      return mcpMemberInvite(
        ctx.session.user.id,
        organizationId,
        { email: input.email, role: input.role, teamId: input.teamId },
        { alreadyAuthorized: true, audit: false },
      );
    }),

  revokeInvitation: orgProcedure
    .input(z.object({ invitationId: z.string().min(1) }))
    .use(
      actionGuard("invitation.cancel", (input) => ({
        entityId: (input as { invitationId: string }).invitationId,
        payload: { operation: "revoke" },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      const [row] = await db
        .update(invitation)
        .set({
          status: "canceled",
          revokedAt: new Date(),
          revokedBy: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(invitation.id, input.invitationId),
            eq(invitation.organizationId, organizationId),
            eq(invitation.status, "pending"),
            isNull(invitation.deletedAt),
          ),
        )
        .returning({ id: invitation.id });
      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pending invitation not found.",
        });
      return { success: true };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (isActionsAuditEnabled()) {
      await requireAction("organization.list", { userId, audit: false });
    }

    const rows = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        role: member.role,
        createdAt: organization.createdAt,
        archivedAt: organization.archivedAt,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(
        activeMemberWhere(
          and(eq(member.userId, userId), isNull(organization.deletedAt)),
        ),
      );

    return { items: rows };
  }),

  getBySlug: orgAwareProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [row] = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          role: member.role,
          description: organizationProfile.description,
          websiteUrl: organizationProfile.websiteUrl,
          industry: organizationProfile.industry,
          sizeBand: organizationProfile.sizeBand,
        })
        .from(organization)
        .innerJoin(member, eq(member.organizationId, organization.id))
        .leftJoin(
          organizationProfile,
          eq(organizationProfile.organizationId, organization.id),
        )
        .where(
          activeMemberWhere(
            and(
              eq(organization.slug, input.slug),
              eq(member.userId, userId),
              isNull(organization.deletedAt),
            ),
          ),
        )
        .limit(1);

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      if (isActionsAuditEnabled()) {
        await requireAction("organization.hub.view", {
          userId,
          organizationId: row.id,
          audit: false,
        });
      }

      return row;
    }),

  getProfile: orgProcedure
    .use(actionGuard("organization.settings.view"))
    .query(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const [membership] = await db
        .select({ role: member.role })
        .from(member)
        .where(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, ctx.session.user.id),
            isNull(member.deletedAt),
          ),
        )
        .limit(1);
      const canManageProfile = normalizeOrgRole(membership?.role) === "owner";
      const [row] = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
          archivedAt: organization.archivedAt,
          description: organizationProfile.description,
          legalName: organizationProfile.legalName,
          websiteUrl: organizationProfile.websiteUrl,
          industry: organizationProfile.industry,
          sizeBand: organizationProfile.sizeBand,
          foundedYear: organizationProfile.foundedYear,
          contactEmail: organizationProfile.contactEmail,
          contactPhone: organizationProfile.contactPhone,
          supportUrl: organizationProfile.supportUrl,
          countryCode: organizationProfile.countryCode,
          region: organizationProfile.region,
          city: organizationProfile.city,
          postalCode: organizationProfile.postalCode,
          addressLine1: organizationProfile.addressLine1,
          addressLine2: organizationProfile.addressLine2,
        })
        .from(organization)
        .leftJoin(
          organizationProfile,
          eq(organizationProfile.organizationId, organization.id),
        )
        .where(
          and(
            eq(organization.id, organizationId),
            isNull(organization.deletedAt),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found.",
        });
      }
      return canManageProfile
        ? { ...row, canManageBranding: true }
        : {
            ...row,
            canManageBranding: false,
            legalName: null,
            foundedYear: null,
            contactEmail: null,
            contactPhone: null,
            supportUrl: null,
            countryCode: null,
            region: null,
            city: null,
            postalCode: null,
            addressLine1: null,
            addressLine2: null,
          };
    }),

  updateBrandingLogo: orgProcedure
    .input(z.object({ logo: organizationBrandingLogoSchema }))
    .use(
      actionGuard("organization.settings.update", () => ({
        payload: { surface: "organization_branding", changedFields: ["logo"] },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const [membership] = await db
        .select({ role: member.role })
        .from(member)
        .where(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, ctx.session.user.id),
            isNull(member.deletedAt),
          ),
        )
        .limit(1);
      if (normalizeOrgRole(membership?.role) !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only organization owners can change branding.",
        });
      }
      const [updated] = await db
        .update(organization)
        .set({
          logo: input.logo,
          updatedAt: new Date(),
          updatedBy: ctx.session.user.id,
        })
        .where(
          and(
            eq(organization.id, organizationId),
            isNull(organization.deletedAt),
          ),
        )
        .returning({ id: organization.id });
      if (!updated)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found.",
        });
      return { success: true };
    }),

  updateProfile: orgProcedure
    .input(organizationProfilePatchSchema)
    .use(
      actionGuard("organization.settings.update", (input) => ({
        payload: {
          surface: "organization_profile",
          changedFields: Object.keys(input as Record<string, unknown>).sort(),
        },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const values = {
        ...input,
        countryCode:
          input.countryCode === undefined
            ? undefined
            : (input.countryCode?.toUpperCase() ?? null),
        updatedAt: new Date(),
        updatedBy: ctx.session.user.id,
      };
      await db.transaction(async (tx) => {
        await tx
          .insert(organizationProfile)
          .values({
            organizationId,
            ...values,
          })
          .onConflictDoUpdate({
            target: organizationProfile.organizationId,
            set: values,
          });
        await tx
          .update(organization)
          .set({ updatedAt: new Date(), updatedBy: ctx.session.user.id })
          .where(eq(organization.id, organizationId));
      });
      return { success: true };
    }),

  getSettings: orgProcedure
    .use(actionGuard("organization.settings.view"))
    .query(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const [row] = await db
        .select()
        .from(organizationSettings)
        .where(eq(organizationSettings.organizationId, organizationId))
        .limit(1);
      const [membership] = await db
        .select({ role: member.role })
        .from(member)
        .where(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, ctx.session.user.id),
            isNull(member.deletedAt),
          ),
        )
        .limit(1);
      return {
        timeZone: row?.timeZone ?? "UTC",
        locale: row?.locale ?? "en",
        dateFormat: row?.dateFormat ?? "medium",
        timeFormat: row?.timeFormat ?? "12h",
        weekStart: row?.weekStart ?? 1,
        displayCurrency: row?.displayCurrency ?? "USD",
        defaultProjectVisibility: row?.defaultProjectVisibility ?? "private",
        notificationDefaults: row?.notificationDefaults ?? {
          email: true,
          inApp: true,
          version: 1 as const,
        },
        canEdit: normalizeOrgRole(membership?.role) === "owner",
      };
    }),

  updateSettings: orgProcedure
    .input(organizationSettingsPatchSchema)
    .use(
      actionGuard("organization.settings.update", (input) => ({
        payload: {
          surface: "organization_settings",
          changedFields: Object.keys(input as Record<string, unknown>).sort(),
        },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const [membership] = await db
        .select({ role: member.role })
        .from(member)
        .where(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, ctx.session.user.id),
            isNull(member.deletedAt),
          ),
        )
        .limit(1);
      if (normalizeOrgRole(membership?.role) !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only organization owners can update workspace defaults.",
        });
      }
      await db
        .insert(organizationSettings)
        .values({
          organizationId,
          ...input,
          updatedAt: new Date(),
          updatedBy: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          target: organizationSettings.organizationId,
          set: {
            ...input,
            updatedAt: new Date(),
            updatedBy: ctx.session.user.id,
          },
        });
      return { success: true };
    }),

  listSecurityDomains: orgProcedure
    .use(actionGuard("organization.settings.view"))
    .query(async ({ ctx }) => {
      if (!ctx.activeOrganizationId) return { items: [] };
      const items = await db
        .select({
          id: organizationDomain.id,
          hostname: organizationDomain.hostname,
          purpose: organizationDomain.purpose,
          state: organizationDomain.state,
          challengeExpiresAt: organizationDomain.challengeExpiresAt,
          verifiedAt: organizationDomain.verifiedAt,
          createdAt: organizationDomain.createdAt,
        })
        .from(organizationDomain)
        .where(eq(organizationDomain.organizationId, ctx.activeOrganizationId))
        .orderBy(desc(organizationDomain.createdAt));
      return { items };
    }),

  createSecurityDomain: orgProcedure
    .input(z.object({ hostname: z.string().min(1).max(253) }))
    .use(
      actionGuard("organization.settings.update", (_input) => ({
        payload: {
          surface: "organization_domain",
          changedFields: ["hostname"],
        },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      await requireOrganizationOwner(ctx.session.user.id, organizationId);
      let hostname: string;
      try {
        hostname = normalizeOrganizationEmailDomain(input.hostname);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Invalid domain.",
        });
      }
      const [existing] = await db
        .select({ id: organizationDomain.id })
        .from(organizationDomain)
        .where(
          and(
            eq(organizationDomain.organizationId, organizationId),
            eq(organizationDomain.hostname, hostname),
            sql`${organizationDomain.state} <> 'revoked'`,
          ),
        )
        .limit(1);
      if (existing)
        throw new TRPCError({
          code: "CONFLICT",
          message: "This domain is already added.",
        });
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const id = randomUUID();
      try {
        await db.insert(organizationDomain).values({
          id,
          organizationId,
          hostname,
          purpose: "email",
          state: "pending",
          verificationTokenHash: hashDomainChallenge(token),
          challengeExpiresAt: expiresAt,
          createdBy: ctx.session.user.id,
        });
      } catch {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This domain is already claimed or pending verification.",
        });
      }
      return {
        id,
        hostname,
        state: "pending" as const,
        txtRecord: {
          name: `_loftlancer-verification.${hostname}`,
          value: token,
        },
        expiresAt,
      };
    }),

  verifySecurityDomain: orgProcedure
    .input(z.object({ domainId: z.string().uuid() }))
    .use(
      actionGuard("organization.settings.update", () => ({
        payload: { surface: "organization_domain", changedFields: ["state"] },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      await requireOrganizationOwner(ctx.session.user.id, organizationId);
      const [row] = await db
        .select()
        .from(organizationDomain)
        .where(
          and(
            eq(organizationDomain.id, input.domainId),
            eq(organizationDomain.organizationId, organizationId),
          ),
        )
        .limit(1);
      if (row?.state !== "pending")
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pending domain verification not found.",
        });
      if (row.challengeExpiresAt <= new Date())
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "The verification record expired. Remove the domain and add it again.",
        });
      let records: string[][] = [];
      try {
        records = await Promise.race([
          resolveTxt(`_loftlancer-verification.${row.hostname}`),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("DNS lookup timed out")), 3000),
          ),
        ]);
      } catch {
        return {
          verified: false,
          message:
            "TXT record was not found yet. DNS changes can take time to appear.",
        };
      }
      if (!domainChallengeMatches(records, row.verificationTokenHash)) {
        return {
          verified: false,
          message:
            "TXT record does not match the current verification challenge.",
        };
      }
      const [updated] = await db
        .update(organizationDomain)
        .set({ state: "verified", verifiedAt: new Date() })
        .where(
          and(
            eq(organizationDomain.id, row.id),
            eq(organizationDomain.organizationId, organizationId),
            eq(organizationDomain.state, "pending"),
          ),
        )
        .returning({ id: organizationDomain.id });
      if (!updated)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Domain status changed. Refresh and try again.",
        });
      return { verified: true, message: "Domain ownership verified." };
    }),

  revokeSecurityDomain: orgProcedure
    .input(z.object({ domainId: z.string().uuid() }))
    .use(
      actionGuard("organization.settings.update", () => ({
        payload: { surface: "organization_domain", changedFields: ["state"] },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      await requireOrganizationOwner(ctx.session.user.id, organizationId);
      const [row] = await db
        .update(organizationDomain)
        .set({ state: "revoked", revokedAt: new Date() })
        .where(
          and(
            eq(organizationDomain.id, input.domainId),
            eq(organizationDomain.organizationId, organizationId),
            sql`${organizationDomain.state} <> 'revoked'`,
          ),
        )
        .returning({ id: organizationDomain.id });
      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Domain not found.",
        });
      return { success: true };
    }),

  archive: orgProcedure
    .use(actionGuard("organization.archive"))
    .mutation(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const now = new Date();
      const [row] = await db
        .update(organization)
        .set({
          archivedAt: now,
          archivedBy: ctx.session.user.id,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
        })
        .where(
          and(
            eq(organization.id, organizationId),
            isNull(organization.deletedAt),
            isNull(organization.archivedAt),
          ),
        )
        .returning({ id: organization.id });
      if (!row)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Organization is already archived or unavailable.",
        });
      return { success: true };
    }),

  unarchive: orgProcedure
    .use(actionGuard("organization.unarchive"))
    .mutation(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const [row] = await db
        .update(organization)
        .set({
          archivedAt: null,
          archivedBy: null,
          updatedAt: new Date(),
          updatedBy: ctx.session.user.id,
        })
        .where(
          and(
            eq(organization.id, organizationId),
            isNull(organization.deletedAt),
            sql`${organization.archivedAt} IS NOT NULL`,
          ),
        )
        .returning({ id: organization.id });
      if (!row)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Organization is not archived or is unavailable.",
        });
      return { success: true };
    }),

  listMembers: orgProcedure
    .use(actionGuard("member.list"))
    .query(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        return { items: [] };
      }
      return mcpMembersList(ctx.session.user.id, organizationId);
    }),

  getMemberAccessSummary: orgProcedure
    .input(z.object({ memberId: z.string().min(1) }))
    .use(
      actionGuard("member.list", (input) => ({
        entityId: (input as { memberId: string }).memberId,
      })),
    )
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) return null;
      const summary = await loadMemberAccessSummary({
        organizationId,
        memberId: input.memberId,
        viewerUserId: ctx.session.user.id,
      });
      if (!summary) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }
      return summary;
    }),

  removeMember: orgProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        reason: z.string().trim().max(250).optional(),
      }),
    )
    .use(
      actionGuard("member.remove", (input) => ({
        targetUserId: (input as { userId: string }).userId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      return mcpMemberRemove(
        ctx.session.user.id,
        organizationId,
        input.userId,
        input.reason,
      );
    }),

  /** Server-side paginated invitations with status filter (#261). Better
   * Auth's listInvitations caps at 100 rows. */
  listInvitations: orgProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        teamId: z.string().min(1).optional(),
        status: z
          .enum([
            "all",
            "pending",
            "expired",
            "accepted",
            "rejected",
            "canceled",
          ])
          .default("all"),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      await requireAction("member.list", {
        userId: ctx.session.user.id,
        organizationId: input.organizationId,
        audit: false,
      });
      if (input.teamId) {
        const [teamRow] = await db
          .select({ id: team.id })
          .from(team)
          .where(
            and(
              eq(team.id, input.teamId),
              eq(team.organizationId, input.organizationId),
              isNull(team.deletedAt),
            ),
          )
          .limit(1);
        if (!teamRow) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
        }
      }
      const now = new Date();
      const org = and(
        eq(invitation.organizationId, input.organizationId),
        isNull(invitation.projectId),
        input.teamId
          ? eq(invitation.teamId, input.teamId)
          : isNull(invitation.teamId),
      );
      const byStatus: Record<string, SQL | undefined> = {
        all: org,
        pending: and(
          org,
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, now),
        ),
        expired: and(
          org,
          eq(invitation.status, "pending"),
          lte(invitation.expiresAt, now),
        ),
        accepted: and(org, eq(invitation.status, "accepted")),
        rejected: and(org, eq(invitation.status, "rejected")),
        canceled: and(org, eq(invitation.status, "canceled")),
      };
      const where = byStatus[input.status];
      const [rows, counts] = await Promise.all([
        db
          .select({
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            teamName: team.name,
            status: invitation.status,
            createdAt: invitation.createdAt,
            expiresAt: invitation.expiresAt,
            inviterName: user.name,
          })
          .from(invitation)
          .leftJoin(user, eq(invitation.inviterId, user.id))
          .leftJoin(team, eq(invitation.teamId, team.id))
          .where(where)
          .orderBy(desc(invitation.expiresAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({
            all: sql<number>`count(*)::int`,
            pending: sql<number>`count(*) filter (where ${invitation.status} = 'pending' and ${invitation.expiresAt} > ${now})::int`,
            expired: sql<number>`count(*) filter (where ${invitation.status} = 'pending' and ${invitation.expiresAt} <= ${now})::int`,
            accepted: sql<number>`count(*) filter (where ${invitation.status} = 'accepted')::int`,
            rejected: sql<number>`count(*) filter (where ${invitation.status} = 'rejected')::int`,
            canceled: sql<number>`count(*) filter (where ${invitation.status} = 'canceled')::int`,
          })
          .from(invitation)
          .where(org),
      ]);
      const c = counts[0] ?? {
        all: 0,
        pending: 0,
        expired: 0,
        accepted: 0,
        rejected: 0,
        canceled: 0,
      };
      const linkedProjects = input.teamId
        ? await db
            .select({ name: project.name })
            .from(projectTeam)
            .innerJoin(project, eq(projectTeam.projectId, project.id))
            .where(
              and(
                eq(projectTeam.teamId, input.teamId),
                eq(projectTeam.organizationId, input.organizationId),
                isNull(projectTeam.deletedAt),
                isNull(project.deletedAt),
              ),
            )
            .orderBy(project.name)
        : [];
      return {
        rows: rows.map((row) => ({
          ...row,
          invitedTeamRole: input.teamId ? ("member" as const) : null,
          linkedProjects: linkedProjects.map(({ name }) => name),
        })),
        counts: c,
        total: c[input.status] ?? 0,
      };
    }),
});
