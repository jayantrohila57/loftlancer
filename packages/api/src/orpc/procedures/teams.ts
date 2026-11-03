import { teamAvailableMembersController } from "@module/teams/server/controller/server.team-available-members.controller";
import { teamCreateController } from "@module/teams/server/controller/server.team-create.controller";
import { teamDeleteController } from "@module/teams/server/controller/server.team-delete.controller";
import { teamGetController } from "@module/teams/server/controller/server.team-get.controller";
import { teamInvitationContextController } from "@module/teams/server/controller/server.team-invitation-context.controller";
import { teamInvitationCreateController } from "@module/teams/server/controller/server.team-invitation-create.controller";
import { teamInvitationListController } from "@module/teams/server/controller/server.team-invitation-list.controller";
import { teamInvitationResendController } from "@module/teams/server/controller/server.team-invitation-resend.controller";
import { teamInvitationRevokeController } from "@module/teams/server/controller/server.team-invitation-revoke.controller";
import { teamLinkableProjectsController } from "@module/teams/server/controller/server.team-linkable-projects.controller";
import { teamListController } from "@module/teams/server/controller/server.team-list.controller";
import { teamMemberAddController } from "@module/teams/server/controller/server.team-member-add.controller";
import { teamMemberRemoveController } from "@module/teams/server/controller/server.team-member-remove.controller";
import { teamMemberRoleChangeController } from "@module/teams/server/controller/server.team-member-role-change.controller";
import { teamMembersController } from "@module/teams/server/controller/server.team-members.controller";
import { teamProjectAssignController } from "@module/teams/server/controller/server.team-project-assign.controller";
import { teamProjectRemoveController } from "@module/teams/server/controller/server.team-project-remove.controller";
import { teamProjectsController } from "@module/teams/server/controller/server.team-projects.controller";
import { teamRestoreController } from "@module/teams/server/controller/server.team-restore.controller";
import { teamUpdateController } from "@module/teams/server/controller/server.team-update.controller";
import { teamControllerInputSchema } from "@module/teams/utils/validation/utils.team-id.validation";
import { protectedProcedure } from "../protected-procedure";
export const teamsProcedures = {
  projectAssign: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamProjectAssignController({ input, ctx: context }),
    ),
  projectRemove: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamProjectRemoveController({ input, ctx: context }),
    ),
  invitationContext: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamInvitationContextController({ input, ctx: context }),
    ),
  invitationList: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamInvitationListController({ input, ctx: context }),
    ),
  invitationCreate: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamInvitationCreateController({ input, ctx: context }),
    ),
  invitationResend: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamInvitationResendController({ input, ctx: context }),
    ),
  invitationRevoke: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamInvitationRevokeController({ input, ctx: context }),
    ),

  linkableProjects: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamLinkableProjectsController({ input, ctx: context }),
    ),
  projects: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamProjectsController({ input, ctx: context }),
    ),
  update: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamUpdateController({ input, ctx: context }),
    ),
  delete: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamDeleteController({ input, ctx: context }),
    ),
  restore: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamRestoreController({ input, ctx: context }),
    ),
  addMember: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamMemberAddController({ input, ctx: context }),
    ),
  removeMember: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamMemberRemoveController({ input, ctx: context }),
    ),
  updateMemberRole: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamMemberRoleChangeController({ input, ctx: context }),
    ),
  members: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamMembersController({ input, ctx: context }),
    ),
  availableMembers: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamAvailableMembersController({ input, ctx: context }),
    ),

  list: protectedProcedure.handler(({ context }) =>
    teamListController({ ctx: context }),
  ),
  get: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamGetController({ input, ctx: context }),
    ),
  create: protectedProcedure
    .input(teamControllerInputSchema)
    .handler(({ input, context }) =>
      teamCreateController({ input, ctx: context }),
    ),
};
