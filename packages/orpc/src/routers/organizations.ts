import { organizationGetBySlugController } from "@module/organizations/server/controller/server.organization-get-by-slug.controller";
import { organizationGetProfileController } from "@module/organizations/server/controller/server.organization-get-profile.controller";
import {
  organizationProjectInvitationAcceptController,
  organizationTeamInvitationAcceptController,
} from "@module/organizations/server/controller/server.organization-invitation-accept.controller";
import { organizationInvitationCreateController } from "@module/organizations/server/controller/server.organization-invitation-create.controller";
import { organizationInvitationListController } from "@module/organizations/server/controller/server.organization-invitation-list.controller";
import { organizationInvitationPreviewController } from "@module/organizations/server/controller/server.organization-invitation-preview.controller";
import { organizationInvitationResendController } from "@module/organizations/server/controller/server.organization-invitation-resend.controller";
import { organizationInvitationRevokeController } from "@module/organizations/server/controller/server.organization-invitation-revoke.controller";
import {
  organizationArchiveController,
  organizationTransferOwnershipController,
  organizationUnarchiveController,
} from "@module/organizations/server/controller/server.organization-lifecycle.controller";
import { organizationListController } from "@module/organizations/server/controller/server.organization-list.controller";
import {
  organizationMemberAccessSummaryController,
  organizationMemberProfileUpdateController,
  organizationMemberSetSuspendedController,
} from "@module/organizations/server/controller/server.organization-member-admin.controller";
import { organizationMemberRemoveController } from "@module/organizations/server/controller/server.organization-member-remove.controller";
import { organizationMembersController } from "@module/organizations/server/controller/server.organization-members.controller";
import { organizationMyInvitationsController } from "@module/organizations/server/controller/server.organization-my-invitations.controller";
import { organizationProjectInvitationListController } from "@module/organizations/server/controller/server.organization-project-invitation-list.controller";
import {
  organizationRoleAssignController,
  organizationRoleCreateController,
  organizationRoleDeleteController,
  organizationRoleListController,
  organizationRoleUpdateController,
} from "@module/organizations/server/controller/server.organization-roles.controller";
import {
  organizationSecurityDomainCreateController,
  organizationSecurityDomainListController,
  organizationSecurityDomainRevokeController,
  organizationSecurityDomainVerifyController,
} from "@module/organizations/server/controller/server.organization-security-domains.controller";
import {
  organizationLogoUpdateController,
  organizationProfileUpdateController,
  organizationSettingsGetController,
  organizationSettingsUpdateController,
} from "@module/organizations/server/controller/server.organization-settings.controller";
import {
  organizationLifecycleInputSchema,
  organizationLogoInputSchema,
  organizationMemberIdInputSchema,
  organizationMemberProfileInputSchema,
  organizationMemberSuspendInputSchema,
  organizationProfilePatchSchema,
  organizationRoleAssignInputSchema,
  organizationRoleCreateInputSchema,
  organizationRoleIdInputSchema,
  organizationRoleListInputSchema,
  organizationRoleUpdateInputSchema,
  organizationSecurityDomainCreateInputSchema,
  organizationSecurityDomainIdInputSchema,
  organizationSecurityDomainListInputSchema,
  organizationSettingsInputSchema,
  organizationSettingsPatchSchema,
  organizationTransferOwnershipInputSchema,
} from "@module/organizations/utils/validation/utils.organization-admin.validation";
import { organizationGetBySlugInputSchema } from "@module/organizations/utils/validation/utils.organization-get-by-slug.validation";
import { organizationGetProfileInputSchema } from "@module/organizations/utils/validation/utils.organization-get-profile.validation";
import {
  organizationInvitationAcceptInputSchema,
  organizationInvitationCreateInputSchema,
  organizationInvitationIdInputSchema,
  organizationInvitationListInputSchema,
  organizationInvitationPreviewInputSchema,
  organizationMyInvitationsInputSchema,
  organizationProjectInvitationIdInputSchema,
  organizationProjectInvitationListInputSchema,
} from "@module/organizations/utils/validation/utils.organization-invitations.validation";
import { organizationListInputSchema } from "@module/organizations/utils/validation/utils.organization-list.validation";
import {
  organizationMemberRemoveInputSchema,
  organizationMembersInputSchema,
} from "@module/organizations/utils/validation/utils.organization-members.validation";
import type { RunActionContext } from "@module/shared/server/run-action";
import { actionGuard } from "../actions/action-guard";
import { orgProcedure, protectedProcedure, router } from "../index";
import { unwrapServiceResponse } from "../utils/trpc-service-unwrap";

type OrgCtx = {
  session: {
    user: { id: string; emailVerified?: boolean | null };
  };
  activeOrganizationId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function organizationsRunContext(ctx: OrgCtx): RunActionContext {
  return {
    userId: ctx.session.user.id,
    orgId: ctx.activeOrganizationId,
    ip: ctx.ipAddress ?? null,
    userAgent: ctx.userAgent ?? null,
  };
}

function organizationsIdentityContext(ctx: OrgCtx) {
  const user = ctx.session.user as {
    id: string;
    email?: string | null;
    emailVerified?: boolean | null;
  };
  return {
    ...organizationsRunContext(ctx),
    email: user.email ?? "",
    emailVerified: Boolean(user.emailVerified),
  };
}

/** Studio organizations namespace — module controllers only. */
export const organizationsRouter = router({
  list: orgProcedure
    .input(organizationListInputSchema)
    .query(({ ctx, input }) =>
      organizationListController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  getBySlug: orgProcedure
    .input(organizationGetBySlugInputSchema)
    .query(({ ctx, input }) =>
      organizationGetBySlugController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  getProfile: orgProcedure
    .input(organizationGetProfileInputSchema)
    .query(({ ctx, input }) =>
      organizationGetProfileController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  settings: orgProcedure
    .input(organizationSettingsInputSchema)
    .query(({ ctx, input }) =>
      organizationSettingsGetController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  updateSettings: orgProcedure
    .input(organizationSettingsPatchSchema)
    .mutation(({ ctx, input }) =>
      organizationSettingsUpdateController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  updateProfile: orgProcedure
    .input(organizationProfilePatchSchema)
    .mutation(({ ctx, input }) =>
      organizationProfileUpdateController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  updateBrandingLogo: orgProcedure
    .input(organizationLogoInputSchema)
    .mutation(({ ctx, input }) =>
      organizationLogoUpdateController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  members: orgProcedure
    .input(organizationMembersInputSchema)
    .query(({ ctx, input }) =>
      organizationMembersController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  removeMember: orgProcedure
    .input(organizationMemberRemoveInputSchema)
    .mutation(({ ctx, input }) =>
      organizationMemberRemoveController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  myInvitations: orgProcedure
    .input(organizationMyInvitationsInputSchema)
    .query(({ ctx, input }) =>
      organizationMyInvitationsController({
        ctx: organizationsIdentityContext(ctx),
        input,
      }),
    ),
  invitationList: orgProcedure
    .input(organizationInvitationListInputSchema)
    .query(({ ctx, input }) =>
      organizationInvitationListController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  invitationPreview: orgProcedure
    .input(organizationInvitationPreviewInputSchema)
    .query(({ input }) => organizationInvitationPreviewController({ input })),
  invitationCreate: orgProcedure
    .input(organizationInvitationCreateInputSchema)
    .mutation(({ ctx, input }) =>
      organizationInvitationCreateController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  invitationRevoke: orgProcedure
    .input(organizationInvitationIdInputSchema)
    .mutation(({ ctx, input }) =>
      organizationInvitationRevokeController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  invitationResend: orgProcedure
    .input(organizationInvitationIdInputSchema)
    .mutation(({ ctx, input }) =>
      organizationInvitationResendController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  acceptTeamInvitation: orgProcedure
    .input(organizationInvitationAcceptInputSchema)
    .mutation(({ ctx, input }) =>
      organizationTeamInvitationAcceptController({
        ctx: organizationsRunContext(ctx),
        input,
        emailVerified: Boolean(ctx.session.user.emailVerified),
      }),
    ),
  acceptProjectInvitation: orgProcedure
    .input(organizationInvitationAcceptInputSchema)
    .mutation(({ ctx, input }) =>
      organizationProjectInvitationAcceptController({
        ctx: organizationsRunContext(ctx),
        input,
        emailVerified: Boolean(ctx.session.user.emailVerified),
      }),
    ),
  customRoles: orgProcedure
    .input(organizationRoleListInputSchema)
    .query(({ ctx, input }) =>
      organizationRoleListController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  createCustomRole: orgProcedure
    .input(organizationRoleCreateInputSchema)
    .mutation(({ ctx, input }) =>
      organizationRoleCreateController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  updateCustomRole: orgProcedure
    .input(organizationRoleUpdateInputSchema)
    .mutation(({ ctx, input }) =>
      organizationRoleUpdateController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  deleteCustomRole: orgProcedure
    .input(organizationRoleIdInputSchema)
    .mutation(({ ctx, input }) =>
      organizationRoleDeleteController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  assignCustomRole: orgProcedure
    .input(organizationRoleAssignInputSchema)
    .mutation(({ ctx, input }) =>
      organizationRoleAssignController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  securityDomains: orgProcedure
    .input(organizationSecurityDomainListInputSchema)
    .query(({ ctx, input }) =>
      organizationSecurityDomainListController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  createSecurityDomain: orgProcedure
    .input(organizationSecurityDomainCreateInputSchema)
    .mutation(({ ctx, input }) =>
      organizationSecurityDomainCreateController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  verifySecurityDomain: orgProcedure
    .input(organizationSecurityDomainIdInputSchema)
    .mutation(({ ctx, input }) =>
      organizationSecurityDomainVerifyController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  revokeSecurityDomain: orgProcedure
    .input(organizationSecurityDomainIdInputSchema)
    .mutation(({ ctx, input }) =>
      organizationSecurityDomainRevokeController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  archive: orgProcedure
    .input(organizationLifecycleInputSchema)
    .mutation(({ ctx, input }) =>
      organizationArchiveController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  unarchive: orgProcedure
    .input(organizationLifecycleInputSchema)
    .mutation(({ ctx, input }) =>
      organizationUnarchiveController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  transferOwnership: orgProcedure
    .input(organizationTransferOwnershipInputSchema)
    .mutation(({ ctx, input }) =>
      organizationTransferOwnershipController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  memberAccessSummary: orgProcedure
    .input(organizationMemberIdInputSchema)
    .query(({ ctx, input }) =>
      organizationMemberAccessSummaryController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  updateMemberProfile: orgProcedure
    .input(organizationMemberProfileInputSchema)
    .mutation(({ ctx, input }) =>
      organizationMemberProfileUpdateController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),
  setMemberSuspended: orgProcedure
    .input(organizationMemberSuspendInputSchema)
    .mutation(({ ctx, input }) =>
      organizationMemberSetSuspendedController({
        ctx: organizationsRunContext(ctx),
        input,
      }),
    ),

  /** Legacy tRPC aliases — unwrap ServiceResponse for Studio. */
  getSettings: orgProcedure.query(({ ctx }) =>
    unwrapServiceResponse(
      organizationSettingsGetController({
        ctx: organizationsRunContext(ctx),
        input: {},
      }),
    ),
  ),
  listMembers: orgProcedure.query(({ ctx }) =>
    unwrapServiceResponse(
      organizationMembersController({
        ctx: organizationsRunContext(ctx),
        input: {},
      }),
    ),
  ),
  listMyInvitations: protectedProcedure.query(({ ctx }) => {
    const user = ctx.session.user as {
      id: string;
      email?: string | null;
      emailVerified?: boolean | null;
    };
    return unwrapServiceResponse(
      organizationMyInvitationsController({
        ctx: {
          userId: user.id,
          orgId: null,
          ip: ctx.ipAddress ?? null,
          userAgent: ctx.userAgent ?? null,
          email: user.email ?? "",
          emailVerified: Boolean(user.emailVerified),
        },
        input: {},
      }),
    );
  }),
  listProjectInvitations: orgProcedure
    .input(organizationProjectInvitationListInputSchema)
    .use(
      actionGuard("project.read", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .query(({ ctx, input }) =>
      unwrapServiceResponse(
        organizationProjectInvitationListController({
          ctx: organizationsRunContext(ctx),
          input,
        }),
      ),
    ),
  cancelProjectInvitation: orgProcedure
    .input(organizationProjectInvitationIdInputSchema)
    .use(
      actionGuard("project.permission.grant", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(({ ctx, input }) =>
      unwrapServiceResponse(
        organizationInvitationRevokeController({
          ctx: organizationsRunContext(ctx),
          input,
        }),
      ),
    ),
  resendProjectInvitation: orgProcedure
    .input(organizationProjectInvitationIdInputSchema)
    .use(
      actionGuard("project.permission.grant", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(({ ctx, input }) =>
      unwrapServiceResponse(
        organizationInvitationResendController({
          ctx: organizationsRunContext(ctx),
          input,
        }),
      ),
    ),
});
