import type { RunActionContext } from "@module/shared/server/run-action";
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
import { orgProcedure, router } from "../index";

type OrgCtx = {
  session: { user: { id: string } };
  activeOrganizationId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function teamsRunContext(ctx: OrgCtx): RunActionContext {
  return {
    userId: ctx.session.user.id,
    orgId: ctx.activeOrganizationId,
    ip: ctx.ipAddress ?? null,
    userAgent: ctx.userAgent ?? null,
  };
}

/** Studio teams namespace — thin transport to `module/teams` controllers. */
export const teamsRouter = router({
  list: orgProcedure.query(({ ctx }) =>
    teamListController({ ctx: teamsRunContext(ctx) }),
  ),
  get: orgProcedure
    .input(teamGetInputSchema)
    .query(({ ctx, input }) =>
      teamGetController({ ctx: teamsRunContext(ctx), input }),
    ),
  create: orgProcedure
    .input(teamCreateInputSchema)
    .mutation(({ ctx, input }) =>
      teamCreateController({ ctx: teamsRunContext(ctx), input }),
    ),
  update: orgProcedure
    .input(teamUpdateInputSchema)
    .mutation(({ ctx, input }) =>
      teamUpdateController({ ctx: teamsRunContext(ctx), input }),
    ),
  delete: orgProcedure
    .input(teamGetInputSchema)
    .mutation(({ ctx, input }) =>
      teamDeleteController({ ctx: teamsRunContext(ctx), input }),
    ),
  restore: orgProcedure
    .input(teamGetInputSchema)
    .mutation(({ ctx, input }) =>
      teamRestoreController({ ctx: teamsRunContext(ctx), input }),
    ),
  members: orgProcedure
    .input(teamGetInputSchema)
    .query(({ ctx, input }) =>
      teamMembersController({ ctx: teamsRunContext(ctx), input }),
    ),
  availableMembers: orgProcedure
    .input(teamGetInputSchema)
    .query(({ ctx, input }) =>
      teamAvailableMembersController({ ctx: teamsRunContext(ctx), input }),
    ),
  addMember: orgProcedure
    .input(teamMemberInputSchema)
    .mutation(({ ctx, input }) =>
      teamMemberAddController({ ctx: teamsRunContext(ctx), input }),
    ),
  removeMember: orgProcedure
    .input(teamMemberInputSchema)
    .mutation(({ ctx, input }) =>
      teamMemberRemoveController({ ctx: teamsRunContext(ctx), input }),
    ),
  updateMemberRole: orgProcedure
    .input(teamMemberRoleInputSchema)
    .mutation(({ ctx, input }) =>
      teamMemberRoleChangeController({ ctx: teamsRunContext(ctx), input }),
    ),
  projects: orgProcedure
    .input(teamGetInputSchema)
    .query(({ ctx, input }) =>
      teamProjectsController({ ctx: teamsRunContext(ctx), input }),
    ),
  linkableProjects: orgProcedure
    .input(teamGetInputSchema)
    .query(({ ctx, input }) =>
      teamLinkableProjectsController({ ctx: teamsRunContext(ctx), input }),
    ),
  projectAssign: orgProcedure
    .input(teamProjectLinkInputSchema)
    .mutation(({ ctx, input }) =>
      teamProjectAssignController({ ctx: teamsRunContext(ctx), input }),
    ),
  projectRemove: orgProcedure
    .input(teamProjectLinkInputSchema)
    .mutation(({ ctx, input }) =>
      teamProjectRemoveController({ ctx: teamsRunContext(ctx), input }),
    ),
  invitationList: orgProcedure
    .input(teamInvitationListInputSchema)
    .query(({ ctx, input }) =>
      teamInvitationListController({ ctx: teamsRunContext(ctx), input }),
    ),
  invitationContext: orgProcedure
    .input(teamGetInputSchema)
    .query(({ ctx, input }) =>
      teamInvitationContextController({ ctx: teamsRunContext(ctx), input }),
    ),
  invitationCreate: orgProcedure
    .input(teamInvitationCreateInputSchema)
    .mutation(({ ctx, input }) =>
      teamInvitationCreateController({ ctx: teamsRunContext(ctx), input }),
    ),
  invitationResend: orgProcedure
    .input(teamInvitationTargetInputSchema)
    .mutation(({ ctx, input }) =>
      teamInvitationResendController({ ctx: teamsRunContext(ctx), input }),
    ),
  invitationRevoke: orgProcedure
    .input(teamInvitationTargetInputSchema)
    .mutation(({ ctx, input }) =>
      teamInvitationRevokeController({ ctx: teamsRunContext(ctx), input }),
    ),
});
