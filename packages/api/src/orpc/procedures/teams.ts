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
import { teamCreateInputSchema } from "@module/teams/utils/validation/utils.create-team.validation";
import {
  teamInvitationCreateInputSchema,
  teamInvitationListInputSchema,
  teamInvitationTargetInputSchema,
  teamProjectLinkInputSchema,
} from "@module/teams/utils/validation/utils.team-extended.validation";
import { teamGetInputSchema } from "@module/teams/utils/validation/utils.team-id.validation";
import {
  teamMemberInputSchema,
  teamMemberRoleInputSchema,
  teamUpdateInputSchema,
} from "@module/teams/utils/validation/utils.team-operations.validation";
import { protectedProcedure } from "../protected-procedure";
export const teamsProcedures = {
  projectAssign: protectedProcedure
    .input(teamProjectLinkInputSchema)
    .handler(({ input, context }) =>
      teamProjectAssignController({ input, ctx: context }),
    ),
  projectRemove: protectedProcedure
    .input(teamProjectLinkInputSchema)
    .handler(({ input, context }) =>
      teamProjectRemoveController({ input, ctx: context }),
    ),
  invitationContext: protectedProcedure
    .input(teamGetInputSchema)
    .handler(({ input, context }) =>
      teamInvitationContextController({ input, ctx: context }),
    ),
  invitationList: protectedProcedure
    .input(teamInvitationListInputSchema)
    .handler(({ input, context }) =>
      teamInvitationListController({ input, ctx: context }),
    ),
  invitationCreate: protectedProcedure
    .input(teamInvitationCreateInputSchema)
    .handler(({ input, context }) =>
      teamInvitationCreateController({ input, ctx: context }),
    ),
  invitationResend: protectedProcedure
    .input(teamInvitationTargetInputSchema)
    .handler(({ input, context }) =>
      teamInvitationResendController({ input, ctx: context }),
    ),
  invitationRevoke: protectedProcedure
    .input(teamInvitationTargetInputSchema)
    .handler(({ input, context }) =>
      teamInvitationRevokeController({ input, ctx: context }),
    ),

  linkableProjects: protectedProcedure
    .input(teamGetInputSchema)
    .handler(({ input, context }) =>
      teamLinkableProjectsController({ input, ctx: context }),
    ),
  projects: protectedProcedure
    .input(teamGetInputSchema)
    .handler(({ input, context }) =>
      teamProjectsController({ input, ctx: context }),
    ),
  update: protectedProcedure
    .input(teamUpdateInputSchema)
    .handler(({ input, context }) =>
      teamUpdateController({ input, ctx: context }),
    ),
  delete: protectedProcedure
    .input(teamGetInputSchema)
    .handler(({ input, context }) =>
      teamDeleteController({ input, ctx: context }),
    ),
  restore: protectedProcedure
    .input(teamGetInputSchema)
    .handler(({ input, context }) =>
      teamRestoreController({ input, ctx: context }),
    ),
  addMember: protectedProcedure
    .input(teamMemberInputSchema)
    .handler(({ input, context }) =>
      teamMemberAddController({ input, ctx: context }),
    ),
  removeMember: protectedProcedure
    .input(teamMemberInputSchema)
    .handler(({ input, context }) =>
      teamMemberRemoveController({ input, ctx: context }),
    ),
  updateMemberRole: protectedProcedure
    .input(teamMemberRoleInputSchema)
    .handler(({ input, context }) =>
      teamMemberRoleChangeController({ input, ctx: context }),
    ),
  members: protectedProcedure
    .input(teamGetInputSchema)
    .handler(({ input, context }) =>
      teamMembersController({ input, ctx: context }),
    ),
  availableMembers: protectedProcedure
    .input(teamGetInputSchema)
    .handler(({ input, context }) =>
      teamAvailableMembersController({ input, ctx: context }),
    ),

  list: protectedProcedure.handler(({ context }) =>
    teamListController({ ctx: context }),
  ),
  get: protectedProcedure
    .input(teamGetInputSchema)
    .handler(({ input, context }) =>
      teamGetController({ input, ctx: context }),
    ),
  create: protectedProcedure
    .input(teamCreateInputSchema)
    .handler(({ input, context }) =>
      teamCreateController({ input, ctx: context }),
    ),
};
