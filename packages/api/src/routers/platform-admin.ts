import { decrypt } from "@loftlancer/crypto";
import {
  activeEnvironmentVariableWhere,
  activeEnvironmentWhere,
  activeInvitationWhere,
  activeNotificationWhere,
  activeProjectWhere,
  activeUserWhere,
  db,
  softDeleteSet,
} from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { notification } from "@loftlancer/db/schema/notifications";
import {
  oauthAccessToken,
  oauthClient,
  oauthRefreshToken,
} from "@loftlancer/db/schema/oauth";
import {
  invitation,
  member,
  organization,
} from "@loftlancer/db/schema/organization";
import { platformFeatureFlag } from "@loftlancer/db/schema/platform-feature-flag";
import {
  environment,
  environmentVariable,
  project,
} from "@loftlancer/db/schema/projects";
import { rateLimitBucket } from "@loftlancer/db/schema/rate-limit-bucket";
import { team, teamMember } from "@loftlancer/db/schema/team";
import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import { TRPCError } from "@trpc/server";
import {
  and,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import { z } from "zod/v3";
import { requireAction } from "../actions/require-action";
import { lookupProjectIdByEnvironmentId } from "../environment-access";
import { consoleProcedure } from "../index";
import {
  mcpInvitationCancel,
  mcpMemberRemove,
  mcpMemberUpdateRole,
  mcpOrganizationDelete,
  mcpOrganizationRestore,
  mcpOrganizationTransferOwnership,
  mcpOrganizationUpdate,
  mcpTeamAddMember,
  mcpTeamCreate,
  mcpTeamDelete,
  mcpTeamRemoveMember,
  mcpTeamRestore,
  mcpTeamUpdate,
} from "../mcp/organization-ops";
import {
  mcpEnvironmentRestore,
  mcpProjectRestore,
  mcpVariableRestore,
} from "../mcp/restore-ops";
import { createMcpStudioCaller } from "../mcp/studio-caller";
import { mcpVariableReadMetadata } from "../mcp/variable-read";
import {
  loadProjectAccessSummary,
  softDeleteProjectManager,
  softDeleteProjectTeamLink,
  upsertProjectManagerRow,
  upsertProjectTeamLink,
} from "../project-access/service";
import {
  createEnvironmentInput,
  createProjectInput,
  updateEnvironmentInput,
  updateProjectInput,
  updateVariableInput,
} from "../validation";
import { formatVariableRows } from "../variable-format";
import { isVariablesV2Enabled } from "../variables-v2";
import {
  assertPlatformOperatorList,
  platformPaginationInput,
  toIsoString,
} from "./platform-helpers";

const listFiltersInput = platformPaginationInput.extend({
  search: z.string().optional(),
  includeDeleted: z.boolean().optional(),
});

function pageDefaults(input?: { limit?: number; offset?: number }) {
  return {
    limit: input?.limit ?? 50,
    offset: input?.offset ?? 0,
  };
}

function paginated<T>(
  items: T[],
  total: number,
  limit: number,
  offset: number,
) {
  return { items, total, limit, offset };
}

function rethrowNotFound(error: unknown, fallbackMessage: string): never {
  if (error instanceof Error) {
    if (
      error.message.includes("not_found") ||
      error.message === "organization_not_found"
    ) {
      throw new TRPCError({ code: "NOT_FOUND", message: fallbackMessage });
    }
  }
  throw error;
}

export const platformAdminEndpoints = {
  updateUser: consoleProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        name: z.string().trim().min(1).optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const update: Partial<{ name: string; email: string; updatedAt: Date }> =
        {
          updatedAt: new Date(),
        };
      if (input.name !== undefined) update.name = input.name.trim();
      if (input.email !== undefined) update.email = input.email.trim();

      const [row] = await db
        .update(user)
        .set(update)
        .where(activeUserWhere(eq(user.id, input.userId)))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          updatedAt: user.updatedAt,
        });

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return {
        ...row,
        updatedAt: toIsoString(row.updatedAt),
      };
    }),

  softDeleteUser: consoleProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const [existing] = await db
        .select({ id: user.id })
        .from(user)
        .where(activeUserWhere(eq(user.id, input.userId)))
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (isSoftDeletesEnabled()) {
        await db
          .update(user)
          .set(softDeleteSet(ctx.session.user.id))
          .where(eq(user.id, input.userId));
      } else {
        await db.delete(user).where(eq(user.id, input.userId));
      }
      return { ok: true as const };
    }),

  restoreUser: consoleProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      if (!isSoftDeletesEnabled()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Soft deletes are disabled",
        });
      }
      const [row] = await db
        .update(user)
        .set({ deletedAt: null, deletedBy: null })
        .where(eq(user.id, input.userId))
        .returning({ id: user.id, email: user.email });
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      return row;
    }),

  updateOrganization: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        name: z.string().trim().min(1).optional(),
        logo: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        const row = await mcpOrganizationUpdate(
          ctx.session.user.id,
          input.organizationId,
          { name: input.name, logo: input.logo },
        );
        return row;
      } catch (error) {
        rethrowNotFound(error, "Organization not found");
      }
    }),

  transferOrganizationOwner: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        targetUserId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpOrganizationTransferOwnership(
          ctx.session.user.id,
          input.organizationId,
          input.targetUserId,
        );
      } catch (error) {
        rethrowNotFound(error, "Transfer not allowed");
      }
    }),

  deleteOrganization: consoleProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpOrganizationDelete(
          ctx.session.user.id,
          input.organizationId,
        );
      } catch (error) {
        rethrowNotFound(error, "Organization not found");
      }
    }),

  restoreOrganization: consoleProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpOrganizationRestore(
          ctx.session.user.id,
          input.organizationId,
        );
      } catch (error) {
        rethrowNotFound(error, "Organization not found");
      }
    }),

  listMembers: consoleProcedure
    .input(
      listFiltersInput
        .extend({
          organizationId: z.string().optional(),
          role: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);
      const search = input?.search?.trim();

      const conditions: SQL[] = [];
      if (!input?.includeDeleted) {
        conditions.push(isNull(member.deletedAt));
      }
      if (input?.organizationId) {
        conditions.push(eq(member.organizationId, input.organizationId));
      }
      if (input?.role?.trim()) {
        conditions.push(eq(member.role, input.role.trim()));
      }
      if (search) {
        const searchCond = or(
          ilike(user.email, `%${search}%`),
          ilike(user.name, `%${search}%`),
          ilike(organization.name, `%${search}%`),
        );
        if (searchCond) conditions.push(searchCond);
      }
      const where = conditions.length ? and(...conditions) : undefined;

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(member)
          .innerJoin(user, eq(member.userId, user.id))
          .innerJoin(organization, eq(member.organizationId, organization.id))
          .where(where),
        db
          .select({
            id: member.id,
            organizationId: member.organizationId,
            organizationName: organization.name,
            organizationSlug: organization.slug,
            userId: member.userId,
            role: member.role,
            name: user.name,
            email: user.email,
            createdAt: member.createdAt,
            deletedAt: member.deletedAt,
          })
          .from(member)
          .innerJoin(user, eq(member.userId, user.id))
          .innerJoin(organization, eq(member.organizationId, organization.id))
          .where(where)
          .orderBy(desc(member.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      return paginated(
        rows.map((row) => ({
          ...row,
          createdAt: toIsoString(row.createdAt),
          deletedAt: row.deletedAt ? toIsoString(row.deletedAt) : null,
        })),
        countRow?.count ?? 0,
        limit,
        offset,
      );
    }),

  updateMemberRole: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        targetUserId: z.string().min(1),
        role: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpMemberUpdateRole(
          ctx.session.user.id,
          input.organizationId,
          input.targetUserId,
          input.role,
        );
      } catch (error) {
        rethrowNotFound(error, "Member not found");
      }
    }),

  removeMember: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        targetUserId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpMemberRemove(
          ctx.session.user.id,
          input.organizationId,
          input.targetUserId,
        );
      } catch (error) {
        rethrowNotFound(error, "Member not found");
      }
    }),

  listTeams: consoleProcedure
    .input(
      listFiltersInput
        .extend({ organizationId: z.string().optional() })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);
      const search = input?.search?.trim();

      const conditions: SQL[] = [];
      if (!input?.includeDeleted) {
        conditions.push(isNull(team.deletedAt));
      }
      if (input?.organizationId) {
        conditions.push(eq(team.organizationId, input.organizationId));
      }
      if (search) {
        conditions.push(ilike(team.name, `%${search}%`));
      }
      const where = conditions.length ? and(...conditions) : undefined;

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(team)
          .where(where),
        db
          .select({
            id: team.id,
            name: team.name,
            organizationId: team.organizationId,
            memberCount: team.memberCount,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
            deletedAt: team.deletedAt,
          })
          .from(team)
          .where(where)
          .orderBy(team.name)
          .limit(limit)
          .offset(offset),
      ]);

      return paginated(
        rows.map((row) => ({
          ...row,
          createdAt: toIsoString(row.createdAt),
          updatedAt: row.updatedAt ? toIsoString(row.updatedAt) : null,
          deletedAt: row.deletedAt ? toIsoString(row.deletedAt) : null,
        })),
        countRow?.count ?? 0,
        limit,
        offset,
      );
    }),

  getTeam: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        teamId: z.string().min(1),
        includeDeleted: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);

      const teamConditions: SQL[] = [
        eq(team.id, input.teamId),
        eq(team.organizationId, input.organizationId),
      ];
      if (!input.includeDeleted) {
        teamConditions.push(isNull(team.deletedAt));
      }

      const [teamRow] = await db
        .select()
        .from(team)
        .where(and(...teamConditions))
        .limit(1);

      if (!teamRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      }

      const members = await db
        .select({
          id: teamMember.id,
          userId: teamMember.userId,
          name: user.name,
          email: user.email,
          createdAt: teamMember.createdAt,
        })
        .from(teamMember)
        .innerJoin(user, eq(teamMember.userId, user.id))
        .where(eq(teamMember.teamId, input.teamId));

      return {
        team: {
          id: teamRow.id,
          name: teamRow.name,
          organizationId: teamRow.organizationId,
          memberCount: teamRow.memberCount,
          createdAt: toIsoString(teamRow.createdAt),
          updatedAt: teamRow.updatedAt ? toIsoString(teamRow.updatedAt) : null,
          deletedAt: teamRow.deletedAt ? toIsoString(teamRow.deletedAt) : null,
        },
        members: members.map((m) => ({
          ...m,
          createdAt: m.createdAt ? toIsoString(m.createdAt) : null,
        })),
      };
    }),

  createTeam: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        name: z.string().trim().min(1),
        description: z.string().trim().max(500).optional(),
        purpose: z.string().trim().max(250).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      return mcpTeamCreate(
        ctx.session.user.id,
        input.organizationId,
        input.name,
        { description: input.description, purpose: input.purpose },
      );
    }),

  updateTeam: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        teamId: z.string().min(1),
        name: z.string().trim().min(1),
        description: z.string().trim().max(500).nullable().optional(),
        purpose: z.string().trim().max(250).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpTeamUpdate(
          ctx.session.user.id,
          input.organizationId,
          input.teamId,
          input.name,
          { description: input.description, purpose: input.purpose },
        );
      } catch (error) {
        rethrowNotFound(error, "Team not found");
      }
    }),

  deleteTeam: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        teamId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpTeamDelete(
          ctx.session.user.id,
          input.organizationId,
          input.teamId,
        );
      } catch (error) {
        rethrowNotFound(error, "Team not found");
      }
    }),

  restoreTeam: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        teamId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpTeamRestore(
          ctx.session.user.id,
          input.organizationId,
          input.teamId,
        );
      } catch (error) {
        rethrowNotFound(error, "Team not found");
      }
    }),

  addTeamMember: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        teamId: z.string().min(1),
        targetUserId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      return mcpTeamAddMember(
        ctx.session.user.id,
        input.organizationId,
        input.teamId,
        input.targetUserId,
      );
    }),

  removeTeamMember: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        teamId: z.string().min(1),
        targetUserId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      return mcpTeamRemoveMember(
        ctx.session.user.id,
        input.organizationId,
        input.teamId,
        input.targetUserId,
      );
    }),

  listInvitations: consoleProcedure
    .input(
      listFiltersInput
        .extend({
          organizationId: z.string().optional(),
          status: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);
      const search = input?.search?.trim();

      const conditions: SQL[] = [];
      if (!input?.includeDeleted) {
        const active = activeInvitationWhere();
        if (active) conditions.push(active);
      }
      if (input?.organizationId) {
        conditions.push(eq(invitation.organizationId, input.organizationId));
      }
      if (input?.status?.trim()) {
        conditions.push(eq(invitation.status, input.status.trim()));
      }
      if (search) {
        conditions.push(ilike(invitation.email, `%${search}%`));
      }
      const where = conditions.length ? and(...conditions) : undefined;

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(invitation)
          .where(where),
        db
          .select()
          .from(invitation)
          .where(where)
          .orderBy(desc(invitation.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      return paginated(
        rows.map((row) => ({
          id: row.id,
          organizationId: row.organizationId,
          email: row.email,
          role: row.role,
          status: row.status,
          expiresAt: toIsoString(row.expiresAt),
          inviterId: row.inviterId,
          teamId: row.teamId,
          createdAt: toIsoString(row.createdAt),
          deletedAt: row.deletedAt ? toIsoString(row.deletedAt) : null,
        })),
        countRow?.count ?? 0,
        limit,
        offset,
      );
    }),

  revokeInvitation: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        invitationId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpInvitationCancel(
          ctx.session.user.id,
          input.organizationId,
          input.invitationId,
        );
      } catch (error) {
        rethrowNotFound(error, "Invitation not found");
      }
    }),

  resendInvitation: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        invitationId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const [row] = await db
        .update(invitation)
        .set({ expiresAt, status: "pending" })
        .where(
          and(
            eq(invitation.id, input.invitationId),
            eq(invitation.organizationId, input.organizationId),
          ),
        )
        .returning({
          id: invitation.id,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
        });
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }
      return {
        ...row,
        expiresAt: toIsoString(row.expiresAt),
      };
    }),

  listProjects: consoleProcedure
    .input(
      listFiltersInput
        .extend({ organizationId: z.string().optional() })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);
      const search = input?.search?.trim();

      const conditions: SQL[] = [];
      if (!input?.includeDeleted) {
        const active = activeProjectWhere();
        if (active) conditions.push(active);
      }
      if (input?.organizationId) {
        conditions.push(eq(project.organizationId, input.organizationId));
      }
      if (search) {
        const searchCond = or(
          ilike(project.name, `%${search}%`),
          ilike(project.slug, `%${search}%`),
        );
        if (searchCond) conditions.push(searchCond);
      }
      const where = conditions.length ? and(...conditions) : undefined;

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(project)
          .where(where),
        db
          .select({
            id: project.id,
            name: project.name,
            slug: project.slug,
            status: project.status,
            organizationId: project.organizationId,
            userId: project.userId,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            deletedAt: project.deletedAt,
          })
          .from(project)
          .where(where)
          .orderBy(desc(project.updatedAt))
          .limit(limit)
          .offset(offset),
      ]);

      return paginated(
        rows.map((row) => ({
          ...row,
          createdAt: toIsoString(row.createdAt),
          updatedAt: toIsoString(row.updatedAt),
          deletedAt: row.deletedAt ? toIsoString(row.deletedAt) : null,
        })),
        countRow?.count ?? 0,
        limit,
        offset,
      );
    }),

  getProject: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId: input.organizationId,
      });
      const result = await caller.projects.get({ id: input.projectId });
      return result.data;
    }),

  createProject: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        ...createProjectInput.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { organizationId, ...projectInput } = input;
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId,
      });
      const result = await caller.projects.create(projectInput);
      return result.data;
    }),

  updateProject: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        ...updateProjectInput.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { organizationId, ...projectInput } = input;
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId,
      });
      const result = await caller.projects.update(projectInput);
      return result.data;
    }),

  deleteProject: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId: input.organizationId,
      });
      const result = await caller.projects.delete({ id: input.projectId });
      return result.data;
    }),

  restoreProject: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpProjectRestore(
          ctx.session.user.id,
          input.organizationId,
          input.projectId,
        );
      } catch (error) {
        rethrowNotFound(error, "Project not found");
      }
    }),

  listProjectManagers: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId: input.organizationId,
      });
      return caller.projectAccess.listManagers({ projectId: input.projectId });
    }),

  assignProjectManager: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      return upsertProjectManagerRow({
        organizationId: input.organizationId,
        projectId: input.projectId,
        userId: input.userId,
        createdBy: ctx.session.user.id,
      });
    }),

  removeProjectManager: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      return softDeleteProjectManager({
        projectId: input.projectId,
        userId: input.userId,
        actorUserId: ctx.session.user.id,
      });
    }),

  listProjectTeams: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const summary = await loadProjectAccessSummary(input.projectId);
      return { items: summary.teams };
    }),

  linkProjectTeam: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().min(1),
        teamId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      return upsertProjectTeamLink({
        organizationId: input.organizationId,
        projectId: input.projectId,
        teamId: input.teamId,
        createdBy: ctx.session.user.id,
      });
    }),

  unlinkProjectTeam: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().min(1),
        teamId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      return softDeleteProjectTeamLink({
        organizationId: input.organizationId,
        projectId: input.projectId,
        teamId: input.teamId,
        actorUserId: ctx.session.user.id,
      });
    }),

  listEnvironments: consoleProcedure
    .input(
      listFiltersInput
        .extend({
          organizationId: z.string().optional(),
          projectId: z.string().uuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);
      const search = input?.search?.trim();

      const conditions: SQL[] = [];
      if (!input?.includeDeleted) {
        const active = activeEnvironmentWhere();
        if (active) conditions.push(active);
      }
      if (input?.projectId) {
        conditions.push(eq(environment.projectId, input.projectId));
      }
      if (input?.organizationId) {
        conditions.push(eq(project.organizationId, input.organizationId));
      }
      if (search) {
        const searchCond = or(
          ilike(environment.name, `%${search}%`),
          ilike(environment.slug, `%${search}%`),
        );
        if (searchCond) conditions.push(searchCond);
      }
      const where = conditions.length ? and(...conditions) : undefined;

      const base = db
        .select({
          id: environment.id,
          name: environment.name,
          slug: environment.slug,
          status: environment.status,
          projectId: environment.projectId,
          organizationId: project.organizationId,
          createdAt: environment.createdAt,
          updatedAt: environment.updatedAt,
          deletedAt: environment.deletedAt,
        })
        .from(environment)
        .innerJoin(project, eq(environment.projectId, project.id));

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(environment)
          .innerJoin(project, eq(environment.projectId, project.id))
          .where(where),
        base.where(where).orderBy(environment.name).limit(limit).offset(offset),
      ]);

      return paginated(
        rows.map((row) => ({
          ...row,
          createdAt: toIsoString(row.createdAt),
          updatedAt: toIsoString(row.updatedAt),
          deletedAt: row.deletedAt ? toIsoString(row.deletedAt) : null,
        })),
        countRow?.count ?? 0,
        limit,
        offset,
      );
    }),

  getEnvironment: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        environmentId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId: input.organizationId,
      });
      const result = await caller.environments.get({
        id: input.environmentId,
      });
      return result.data;
    }),

  createEnvironment: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        ...createEnvironmentInput.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { organizationId, ...envInput } = input;
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId,
      });
      const result = await caller.environments.create(envInput);
      return result.data;
    }),

  updateEnvironment: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        ...updateEnvironmentInput.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { organizationId, ...envInput } = input;
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId,
      });
      const result = await caller.environments.update(envInput);
      return result.data;
    }),

  deleteEnvironment: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        environmentId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId: input.organizationId,
      });
      return caller.environments.delete({
        id: input.environmentId,
      });
    }),

  restoreEnvironment: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().uuid(),
        environmentId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpEnvironmentRestore(
          ctx.session.user.id,
          input.organizationId,
          input.projectId,
          input.environmentId,
        );
      } catch (error) {
        rethrowNotFound(error, "Environment not found");
      }
    }),

  listVariables: consoleProcedure
    .input(
      listFiltersInput
        .extend({
          environmentId: z.string().uuid().optional(),
          organizationId: z.string().optional(),
          projectId: z.string().uuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);
      const search = input?.search?.trim();

      const conditions: SQL[] = [];
      if (!input?.includeDeleted) {
        const active = activeEnvironmentVariableWhere();
        if (active) conditions.push(active);
      }
      if (input?.environmentId) {
        conditions.push(
          eq(environmentVariable.environmentId, input.environmentId),
        );
      }
      if (input?.projectId) {
        conditions.push(eq(environment.projectId, input.projectId));
      }
      if (input?.organizationId) {
        conditions.push(eq(project.organizationId, input.organizationId));
      }
      if (search) {
        conditions.push(ilike(environmentVariable.key, `%${search}%`));
      }
      const where = conditions.length ? and(...conditions) : undefined;

      const from = db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          environmentId: environmentVariable.environmentId,
          projectId: environment.projectId,
          organizationId: project.organizationId,
          type: environmentVariable.type,
          note: environmentVariable.note,
          createdAt: environmentVariable.createdAt,
          updatedAt: environmentVariable.updatedAt,
          deletedAt: environmentVariable.deletedAt,
        })
        .from(environmentVariable)
        .innerJoin(
          environment,
          eq(environmentVariable.environmentId, environment.id),
        )
        .innerJoin(project, eq(environment.projectId, project.id));

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(environmentVariable)
          .innerJoin(
            environment,
            eq(environmentVariable.environmentId, environment.id),
          )
          .innerJoin(project, eq(environment.projectId, project.id))
          .where(where),
        from
          .where(where)
          .orderBy(environmentVariable.key)
          .limit(limit)
          .offset(offset),
      ]);

      return paginated(
        rows.map((row) => ({
          id: row.id,
          key: row.key,
          environmentId: row.environmentId,
          projectId: row.projectId,
          organizationId: row.organizationId,
          type: row.type,
          note: row.note,
          createdAt: toIsoString(row.createdAt),
          updatedAt: toIsoString(row.updatedAt),
          deletedAt: row.deletedAt ? toIsoString(row.deletedAt) : null,
        })),
        countRow?.count ?? 0,
        limit,
        offset,
      );
    }),

  getVariable: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        variableId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        const record = await mcpVariableReadMetadata(
          ctx.session.user.id,
          input.organizationId,
          input.variableId,
        );
        return {
          ...record,
          createdAt: toIsoString(record.createdAt),
          updatedAt: toIsoString(record.updatedAt),
        };
      } catch (error) {
        rethrowNotFound(error, "Variable not found");
      }
    }),

  revealVariable: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        variableId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const projectId = await lookupProjectIdForVariable(input.variableId);
      await requireAction("variable.reveal", {
        userId: ctx.session.user.id,
        organizationId: input.organizationId,
        projectId,
      });

      const listWhere = eq(environmentVariable.id, input.variableId);
      const rows = isVariablesV2Enabled()
        ? await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              encryptedValue: environmentVariable.encryptedValue,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
              type: environmentVariable.type,
              note: environmentVariable.note,
            })
            .from(environmentVariable)
            .where(listWhere)
            .limit(1)
        : await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              encryptedValue: environmentVariable.encryptedValue,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
            })
            .from(environmentVariable)
            .where(listWhere)
            .limit(1);

      const record = rows[0];
      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      const formatted = await formatVariableRows([record]);
      const meta = formatted[0];
      if (!meta) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      return {
        ...meta,
        createdAt: toIsoString(meta.createdAt),
        updatedAt: toIsoString(meta.updatedAt),
        value: decrypt(record.encryptedValue),
      };
    }),

  updateVariable: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        ...updateVariableInput.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { organizationId, ...variableInput } = input;
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId,
      });
      const result = await caller.environmentVariables.update(variableInput);
      return result.data;
    }),

  deleteVariable: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        variableId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const caller = await createMcpStudioCaller({
        userId: ctx.session.user.id,
        organizationId: input.organizationId,
      });
      return caller.environmentVariables.delete({
        id: input.variableId,
      });
    }),

  restoreVariable: consoleProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectId: z.string().uuid(),
        variableId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      try {
        return await mcpVariableRestore(
          ctx.session.user.id,
          input.organizationId,
          input.projectId,
          input.variableId,
        );
      } catch (error) {
        rethrowNotFound(error, "Variable not found");
      }
    }),

  listNotifications: consoleProcedure
    .input(
      listFiltersInput
        .extend({
          organizationId: z.string().optional(),
          recipientUserId: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);
      const search = input?.search?.trim();

      const conditions: SQL[] = [];
      if (!input?.includeDeleted) {
        const active = activeNotificationWhere();
        if (active) conditions.push(active);
      }
      if (input?.organizationId) {
        conditions.push(eq(notification.organizationId, input.organizationId));
      }
      if (input?.recipientUserId) {
        conditions.push(
          eq(notification.recipientUserId, input.recipientUserId),
        );
      }
      if (input?.type?.trim()) {
        conditions.push(eq(notification.type, input.type.trim()));
      }
      if (search) {
        const searchCond = or(
          ilike(notification.title, `%${search}%`),
          ilike(notification.recipientEmail, `%${search}%`),
        );
        if (searchCond) conditions.push(searchCond);
      }
      const where = conditions.length ? and(...conditions) : undefined;

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(notification)
          .where(where),
        db
          .select({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            recipientUserId: notification.recipientUserId,
            recipientEmail: notification.recipientEmail,
            organizationId: notification.organizationId,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            deletedAt: notification.deletedAt,
          })
          .from(notification)
          .where(where)
          .orderBy(desc(notification.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      return paginated(
        rows.map((row) => ({
          ...row,
          readAt: row.readAt ? toIsoString(row.readAt) : null,
          createdAt: toIsoString(row.createdAt),
          deletedAt: row.deletedAt ? toIsoString(row.deletedAt) : null,
        })),
        countRow?.count ?? 0,
        limit,
        offset,
      );
    }),

  deleteNotification: consoleProcedure
    .input(z.object({ notificationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const [existing] = await db
        .select({ id: notification.id })
        .from(notification)
        .where(
          activeNotificationWhere(eq(notification.id, input.notificationId)),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }
      await db
        .update(notification)
        .set(softDeleteSet(ctx.session.user.id))
        .where(eq(notification.id, input.notificationId));
      return { ok: true as const };
    }),

  listOAuthClients: consoleProcedure
    .input(
      listFiltersInput
        .extend({
          userId: z.string().optional(),
          disabled: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);
      const search = input?.search?.trim();

      const conditions: SQL[] = [];
      if (input?.userId) {
        conditions.push(eq(oauthClient.userId, input.userId));
      }
      if (input?.disabled !== undefined) {
        conditions.push(eq(oauthClient.disabled, input.disabled));
      }
      if (search) {
        const searchCond = or(
          ilike(oauthClient.name, `%${search}%`),
          ilike(oauthClient.clientId, `%${search}%`),
        );
        if (searchCond) conditions.push(searchCond);
      }
      const where = conditions.length ? and(...conditions) : undefined;

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(oauthClient)
          .where(where),
        db
          .select({
            id: oauthClient.id,
            clientId: oauthClient.clientId,
            name: oauthClient.name,
            userId: oauthClient.userId,
            disabled: oauthClient.disabled,
            createdAt: oauthClient.createdAt,
            updatedAt: oauthClient.updatedAt,
          })
          .from(oauthClient)
          .where(where)
          .orderBy(desc(oauthClient.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      return paginated(
        rows.map((row) => ({
          ...row,
          disabled: row.disabled ?? false,
          createdAt: row.createdAt ? toIsoString(row.createdAt) : null,
          updatedAt: row.updatedAt ? toIsoString(row.updatedAt) : null,
        })),
        countRow?.count ?? 0,
        limit,
        offset,
      );
    }),

  revokeOAuthClient: consoleProcedure
    .input(z.object({ clientId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const [row] = await db
        .update(oauthClient)
        .set({ disabled: true, updatedAt: new Date() })
        .where(eq(oauthClient.clientId, input.clientId))
        .returning({
          clientId: oauthClient.clientId,
          disabled: oauthClient.disabled,
        });
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "OAuth client not found",
        });
      }
      return row;
    }),

  listOAuthTokens: consoleProcedure
    .input(
      listFiltersInput
        .extend({
          userId: z.string().optional(),
          clientId: z.string().optional(),
          revokedOnly: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);

      const accessConditions: SQL[] = [];
      const refreshConditions: SQL[] = [];
      if (input?.userId) {
        accessConditions.push(eq(oauthAccessToken.userId, input.userId));
        refreshConditions.push(eq(oauthRefreshToken.userId, input.userId));
      }
      if (input?.clientId) {
        accessConditions.push(eq(oauthAccessToken.clientId, input.clientId));
        refreshConditions.push(eq(oauthRefreshToken.clientId, input.clientId));
      }
      if (input?.revokedOnly) {
        accessConditions.push(isNotNull(oauthAccessToken.revoked));
        refreshConditions.push(isNotNull(oauthRefreshToken.revoked));
      } else if (input?.revokedOnly === false) {
        accessConditions.push(isNull(oauthAccessToken.revoked));
        refreshConditions.push(isNull(oauthRefreshToken.revoked));
      }

      const accessWhere = accessConditions.length
        ? and(...accessConditions)
        : undefined;
      const refreshWhere = refreshConditions.length
        ? and(...refreshConditions)
        : undefined;

      const [accessRows, refreshRows] = await Promise.all([
        db
          .select({
            id: oauthAccessToken.id,
            clientId: oauthAccessToken.clientId,
            userId: oauthAccessToken.userId,
            scopes: oauthAccessToken.scopes,
            expiresAt: oauthAccessToken.expiresAt,
            createdAt: oauthAccessToken.createdAt,
            revoked: oauthAccessToken.revoked,
          })
          .from(oauthAccessToken)
          .where(accessWhere)
          .orderBy(desc(oauthAccessToken.createdAt))
          .limit(limit + offset),
        db
          .select({
            id: oauthRefreshToken.id,
            clientId: oauthRefreshToken.clientId,
            userId: oauthRefreshToken.userId,
            scopes: oauthRefreshToken.scopes,
            expiresAt: oauthRefreshToken.expiresAt,
            createdAt: oauthRefreshToken.createdAt,
            revoked: oauthRefreshToken.revoked,
          })
          .from(oauthRefreshToken)
          .where(refreshWhere)
          .orderBy(desc(oauthRefreshToken.createdAt))
          .limit(limit + offset),
      ]);

      const combined = [
        ...accessRows.map((row) => ({
          kind: "access" as const,
          id: row.id,
          clientId: row.clientId,
          userId: row.userId,
          scopes: row.scopes,
          expiresAt: row.expiresAt ? toIsoString(row.expiresAt) : null,
          createdAt: row.createdAt ? toIsoString(row.createdAt) : null,
          revoked: row.revoked ? toIsoString(row.revoked) : null,
        })),
        ...refreshRows.map((row) => ({
          kind: "refresh" as const,
          id: row.id,
          clientId: row.clientId,
          userId: row.userId,
          scopes: row.scopes,
          expiresAt: row.expiresAt ? toIsoString(row.expiresAt) : null,
          createdAt: row.createdAt ? toIsoString(row.createdAt) : null,
          revoked: row.revoked ? toIsoString(row.revoked) : null,
        })),
      ].sort((a, b) => {
        const aTime = a.createdAt ?? "";
        const bTime = b.createdAt ?? "";
        return bTime.localeCompare(aTime);
      });

      const items = combined.slice(offset, offset + limit);
      return paginated(items, combined.length, limit, offset);
    }),

  revokeOAuthToken: consoleProcedure
    .input(
      z.object({
        kind: z.enum(["access", "refresh"]),
        tokenId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const now = new Date();
      if (input.kind === "access") {
        const [row] = await db
          .update(oauthAccessToken)
          .set({ revoked: now })
          .where(
            and(
              eq(oauthAccessToken.id, input.tokenId),
              isNull(oauthAccessToken.revoked),
            ),
          )
          .returning({ id: oauthAccessToken.id });
        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Token not found",
          });
        }
        return row;
      }

      const [row] = await db
        .update(oauthRefreshToken)
        .set({ revoked: now })
        .where(
          and(
            eq(oauthRefreshToken.id, input.tokenId),
            isNull(oauthRefreshToken.revoked),
          ),
        )
        .returning({ id: oauthRefreshToken.id });
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Token not found" });
      }
      return row;
    }),

  listRateLimitBuckets: consoleProcedure
    .input(
      listFiltersInput.extend({ keyPrefix: z.string().optional() }).optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);
      const search = input?.search?.trim() ?? input?.keyPrefix?.trim();

      const where = search
        ? ilike(rateLimitBucket.key, `${search}%`)
        : undefined;

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(rateLimitBucket)
          .where(where),
        db
          .select()
          .from(rateLimitBucket)
          .where(where)
          .orderBy(rateLimitBucket.key)
          .limit(limit)
          .offset(offset),
      ]);

      return paginated(
        rows.map((row) => ({
          key: row.key,
          count: row.count,
          windowStart: toIsoString(row.windowStart),
        })),
        countRow?.count ?? 0,
        limit,
        offset,
      );
    }),

  resetRateLimitBucket: consoleProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const deleted = await db
        .delete(rateLimitBucket)
        .where(eq(rateLimitBucket.key, input.key))
        .returning({ key: rateLimitBucket.key });
      if (deleted.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rate limit bucket not found",
        });
      }
      return { ok: true as const };
    }),

  listFeatureFlags: consoleProcedure
    .input(listFiltersInput.optional())
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const { limit, offset } = pageDefaults(input);
      const search = input?.search?.trim();

      const where = search
        ? ilike(platformFeatureFlag.key, `%${search}%`)
        : undefined;

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(platformFeatureFlag)
          .where(where),
        db
          .select()
          .from(platformFeatureFlag)
          .where(where)
          .orderBy(platformFeatureFlag.key)
          .limit(limit)
          .offset(offset),
      ]);

      return paginated(
        rows.map((row) => ({
          key: row.key,
          enabled: row.enabled,
          updatedAt: toIsoString(row.updatedAt),
          updatedBy: row.updatedBy,
        })),
        countRow?.count ?? 0,
        limit,
        offset,
      );
    }),

  setFeatureFlag: consoleProcedure
    .input(
      z.object({
        key: z.string().min(1),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);
      const [row] = await db
        .insert(platformFeatureFlag)
        .values({
          key: input.key,
          enabled: input.enabled,
          updatedBy: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: platformFeatureFlag.key,
          set: {
            enabled: input.enabled,
            updatedBy: ctx.session.user.id,
            updatedAt: new Date(),
          },
        })
        .returning({
          key: platformFeatureFlag.key,
          enabled: platformFeatureFlag.enabled,
          updatedAt: platformFeatureFlag.updatedAt,
        });

      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update feature flag",
        });
      }

      return {
        ...row,
        updatedAt: toIsoString(row.updatedAt),
      };
    }),
};

async function lookupProjectIdForVariable(variableId: string): Promise<string> {
  const [meta] = await db
    .select({ environmentId: environmentVariable.environmentId })
    .from(environmentVariable)
    .where(eq(environmentVariable.id, variableId))
    .limit(1);
  if (!meta) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Variable not found" });
  }
  const projectId = await lookupProjectIdByEnvironmentId(meta.environmentId);
  if (!projectId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Variable not found" });
  }
  return projectId;
}
