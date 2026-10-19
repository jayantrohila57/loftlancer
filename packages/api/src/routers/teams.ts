import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
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
