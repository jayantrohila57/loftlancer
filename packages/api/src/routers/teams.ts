import { teamAvailableMembersController } from "@module/teams/server/controller/server.team-available-members.controller";
import { teamCreateController } from "@module/teams/server/controller/server.team-create.controller";
import { teamDeleteController } from "@module/teams/server/controller/server.team-delete.controller";
import { teamGetController } from "@module/teams/server/controller/server.team-get.controller";
import { teamLinkableProjectsController } from "@module/teams/server/controller/server.team-linkable-projects.controller";
import { teamListController } from "@module/teams/server/controller/server.team-list.controller";
import { teamMemberAddController } from "@module/teams/server/controller/server.team-member-add.controller";
import { teamMemberRemoveController } from "@module/teams/server/controller/server.team-member-remove.controller";
import { teamMemberRoleChangeController } from "@module/teams/server/controller/server.team-member-role-change.controller";
import { teamMembersController } from "@module/teams/server/controller/server.team-members.controller";
import { teamProjectsController } from "@module/teams/server/controller/server.team-projects.controller";
import { teamRestoreController } from "@module/teams/server/controller/server.team-restore.controller";
import { teamUpdateController } from "@module/teams/server/controller/server.team-update.controller";
import {
  unwrapTeamList,
  unwrapTeamObject,
} from "@module/teams/server/handlers/server.legacy-response.handler";
import { teamCreateInputSchema } from "@module/teams/utils/validation/utils.create-team.validation";
import { teamGetInputSchema } from "@module/teams/utils/validation/utils.team-id.validation";
import {
  teamMemberInputSchema,
  teamMemberRoleInputSchema,
  teamUpdateInputSchema,
} from "@module/teams/utils/validation/utils.team-operations.validation";
import { orgProcedure, router } from "../index";

/** Compatibility transport only. Native module clients use oRPC ServiceResponse. */
export const teamsRouter = router({
  list: orgProcedure.query(async ({ ctx }) =>
    unwrapTeamList(
      await teamListController({
        ctx: {
          userId: ctx.session.user.id,
          orgId: ctx.activeOrganizationId,
          ip: ctx.ipAddress,
          userAgent: ctx.userAgent,
        },
      }),
    ),
  ),
  get: orgProcedure.input(teamGetInputSchema).query(async ({ ctx, input }) => ({
    team: unwrapTeamObject(
      await teamGetController({
        input,
        ctx: {
          userId: ctx.session.user.id,
          orgId: ctx.activeOrganizationId,
          ip: ctx.ipAddress,
          userAgent: ctx.userAgent,
        },
      }),
    ),
  })),
  members: orgProcedure
    .input(teamGetInputSchema)
    .query(async ({ ctx, input }) =>
      unwrapTeamList(
        await teamMembersController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
  availableMembers: orgProcedure
    .input(teamGetInputSchema)
    .query(async ({ ctx, input }) =>
      unwrapTeamList(
        await teamAvailableMembersController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
  projects: orgProcedure
    .input(teamGetInputSchema)
    .query(async ({ ctx, input }) =>
      unwrapTeamList(
        await teamProjectsController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
  linkableProjects: orgProcedure
    .input(teamGetInputSchema)
    .query(async ({ ctx, input }) =>
      unwrapTeamList(
        await teamLinkableProjectsController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
  create: orgProcedure
    .input(teamCreateInputSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapTeamObject(
        await teamCreateController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
  update: orgProcedure
    .input(teamUpdateInputSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapTeamObject(
        await teamUpdateController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
  delete: orgProcedure
    .input(teamGetInputSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapTeamObject(
        await teamDeleteController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
  restore: orgProcedure
    .input(teamGetInputSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapTeamObject(
        await teamRestoreController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
  addMember: orgProcedure
    .input(teamMemberInputSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapTeamObject(
        await teamMemberAddController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
  removeMember: orgProcedure
    .input(teamMemberInputSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapTeamObject(
        await teamMemberRemoveController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
  updateMemberRole: orgProcedure
    .input(teamMemberRoleInputSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapTeamObject(
        await teamMemberRoleChangeController({
          input,
          ctx: {
            userId: ctx.session.user.id,
            orgId: ctx.activeOrganizationId,
            ip: ctx.ipAddress,
            userAgent: ctx.userAgent,
          },
        }),
      ),
    ),
});
