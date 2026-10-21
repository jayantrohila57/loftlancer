import { db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { projectTeam } from "@loftlancer/db/schema/project-access";
import { project } from "@loftlancer/db/schema/projects";
import { team } from "@loftlancer/db/schema/team";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { requireAction } from "../actions/require-action";
import { orgProcedure, router } from "../index";
import {
  mcpTeamAddMember,
  mcpTeamChangeMemberRole,
  mcpTeamCreate,
  mcpTeamDelete,
  mcpTeamRemoveMember,
  mcpTeamRestore,
  mcpTeamsList,
  mcpTeamUpdate,
  teamEligibleMembersList,
  teamMembersList,
} from "../mcp/organization-ops";

export const teamsRouter = router({
  list: orgProcedure.use(actionGuard("member.list")).query(async ({ ctx }) => {
    const organizationId = ctx.activeOrganizationId;
    if (!organizationId) {
      return { items: [] };
    }
    return mcpTeamsList(ctx.session.user.id, organizationId);
  }),

  members: orgProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .use(
      actionGuard("team.member.list", (input) => ({
        teamId: (input as { teamId: string }).teamId,
      })),
    )
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        return { items: [] };
      }
      return teamMembersList(ctx.session.user.id, organizationId, input.teamId);
    }),

  get: orgProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .use(
      actionGuard("team.member.list", (input) => ({
        teamId: (input as { teamId: string }).teamId,
      })),
    )
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) return { team: null };
      const creator = alias(user, "team_creator");
      const updater = alias(user, "team_updater");
      const [row] = await db
        .select({
          id: team.id,
          name: team.name,
          description: team.description,
          purpose: team.purpose,
          organizationId: team.organizationId,
          createdAt: team.createdAt,
          createdBy: team.createdBy,
          createdByName: creator.name,
          updatedAt: team.updatedAt,
          updatedBy: team.updatedBy,
          updatedByName: updater.name,
        })
        .from(team)
        .leftJoin(creator, eq(team.createdBy, creator.id))
        .leftJoin(updater, eq(team.updatedBy, updater.id))
        .where(
          and(
            eq(team.id, input.teamId),
            eq(team.organizationId, organizationId),
            isNull(team.deletedAt),
          ),
        )
        .limit(1);
      return { team: row ?? null };
    }),

  availableMembers: orgProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .use(
      actionGuard("team.member.add", (input) => ({
        teamId: (input as { teamId: string }).teamId,
      })),
    )
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) return { items: [] };
      return teamEligibleMembersList(
        ctx.session.user.id,
        organizationId,
        input.teamId,
      );
    }),

  projects: orgProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .use(
      actionGuard("team.member.list", (input) => ({
        teamId: (input as { teamId: string }).teamId,
      })),
    )
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) return { items: [] };

      const rows = await db
        .select({
          id: project.id,
          name: project.name,
          slug: project.slug,
        })
        .from(projectTeam)
        .innerJoin(project, eq(projectTeam.projectId, project.id))
        .innerJoin(team, eq(projectTeam.teamId, team.id))
        .where(
          and(
            eq(projectTeam.organizationId, organizationId),
            eq(projectTeam.teamId, input.teamId),
            eq(team.organizationId, organizationId),
            isNull(team.deletedAt),
            isNull(projectTeam.deletedAt),
            isNull(project.deletedAt),
          ),
        )
        .orderBy(project.name);

      if (rows.length === 0) {
        const [teamRow] = await db
          .select({ id: team.id })
          .from(team)
          .where(
            and(
              eq(team.id, input.teamId),
              eq(team.organizationId, organizationId),
              isNull(team.deletedAt),
            ),
          )
          .limit(1);
        if (!teamRow) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
        }
      }

      const visibleProjects = await Promise.all(
        rows.map(async (row) => {
          try {
            await requireAction("project.read", {
              userId: ctx.session.user.id,
              organizationId,
              projectId: row.id,
              audit: false,
            });
            return row;
          } catch (error) {
            if (error instanceof TRPCError && error.code === "FORBIDDEN") {
              return null;
            }
            throw error;
          }
        }),
      );
      return { items: visibleProjects.filter((row) => row !== null) };
    }),

  linkableProjects: orgProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .use(actionGuard("member.list"))
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) return { items: [] };
      const [teamRow] = await db
        .select({ id: team.id })
        .from(team)
        .where(
          and(
            eq(team.id, input.teamId),
            eq(team.organizationId, organizationId),
            isNull(team.deletedAt),
          ),
        )
        .limit(1);
      if (!teamRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      }
      const rows = await db
        .select({ id: project.id, name: project.name, slug: project.slug })
        .from(project)
        .where(
          and(
            eq(project.organizationId, organizationId),
            isNull(project.deletedAt),
          ),
        )
        .orderBy(project.name);
      const permitted = await Promise.all(
        rows.map(async (row) => {
          try {
            await requireAction("project.assign_team", {
              userId: ctx.session.user.id,
              organizationId,
              projectId: row.id,
              audit: false,
            });
            return row;
          } catch (error) {
            if (error instanceof TRPCError && error.code === "FORBIDDEN") {
              return null;
            }
            throw error;
          }
        }),
      );
      return { items: permitted.filter((row) => row !== null) };
    }),

  create: orgProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(100),
        description: z.string().trim().max(500).optional(),
        purpose: z.string().trim().max(250).optional(),
      }),
    )
    .use(actionGuard("team.create"))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active org");
      }
      return mcpTeamCreate(ctx.session.user.id, organizationId, input.name, {
        description: input.description,
        purpose: input.purpose,
      });
    }),

  update: orgProcedure
    .input(
      z.object({
        teamId: z.string().min(1),
        name: z.string().trim().min(1).max(100),
        description: z.string().trim().max(500).nullable().optional(),
        purpose: z.string().trim().max(250).nullable().optional(),
      }),
    )
    .use(actionGuard("team.update"))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active org");
      }
      return mcpTeamUpdate(
        ctx.session.user.id,
        organizationId,
        input.teamId,
        input.name,
        { description: input.description, purpose: input.purpose },
      );
    }),

  delete: orgProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .use(actionGuard("team.delete"))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active org");
      }
      return mcpTeamDelete(ctx.session.user.id, organizationId, input.teamId);
    }),

  restore: orgProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .use(actionGuard("team.restore"))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active org");
      }
      return mcpTeamRestore(ctx.session.user.id, organizationId, input.teamId);
    }),

  addMember: orgProcedure
    .input(z.object({ teamId: z.string().min(1), userId: z.string().min(1) }))
    .use(
      actionGuard("team.member.add", (input) => ({
        teamId: (input as { teamId: string }).teamId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active org");
      }
      return mcpTeamAddMember(
        ctx.session.user.id,
        organizationId,
        input.teamId,
        input.userId,
      );
    }),

  removeMember: orgProcedure
    .input(z.object({ teamId: z.string().min(1), userId: z.string().min(1) }))
    .use(
      actionGuard("team.member.remove", (input) => ({
        teamId: (input as { teamId: string }).teamId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active org");
      }
      return mcpTeamRemoveMember(
        ctx.session.user.id,
        organizationId,
        input.teamId,
        input.userId,
      );
    }),

  updateMemberRole: orgProcedure
    .input(
      z.object({
        teamId: z.string().min(1),
        userId: z.string().min(1),
        role: z.enum(["lead", "member"]),
      }),
    )
    .use(
      actionGuard("team.member.role.change", (input) => ({
        teamId: (input as { teamId: string }).teamId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) throw new Error("No active org");
      return mcpTeamChangeMemberRole(
        ctx.session.user.id,
        organizationId,
        input.teamId,
        input.userId,
        input.role,
      );
    }),
});
