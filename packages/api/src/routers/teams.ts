import { db } from "@loftlancer/db";
import { projectTeam } from "@loftlancer/db/schema/project-access";
import { project } from "@loftlancer/db/schema/projects";
import { team } from "@loftlancer/db/schema/team";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { requireAction } from "../actions/require-action";
import { orgProcedure, router } from "../index";
import {
  mcpTeamAddMember,
  mcpTeamCreate,
  mcpTeamDelete,
  mcpTeamRemoveMember,
  mcpTeamRestore,
  mcpTeamsList,
  mcpTeamUpdate,
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
    .use(actionGuard("member.list"))
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        return { items: [] };
      }
      return teamMembersList(ctx.session.user.id, organizationId, input.teamId);
    }),

  projects: orgProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .use(actionGuard("member.list"))
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

  create: orgProcedure
    .input(z.object({ name: z.string().min(1) }))
    .use(actionGuard("team.create"))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new Error("No active org");
      }
      return mcpTeamCreate(
        ctx.session.user.id,
        organizationId,
        input.name.trim(),
      );
    }),

  update: orgProcedure
    .input(z.object({ teamId: z.string().min(1), name: z.string().min(1) }))
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
        input.name.trim(),
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
    .use(actionGuard("team.member.add"))
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
    .use(actionGuard("team.member.remove"))
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
});
