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
} from "@module/organizations/utils/validation/utils.organization-invitations.validation";
import { organizationListInputSchema } from "@module/organizations/utils/validation/utils.organization-list.validation";
import {
  organizationMemberRemoveInputSchema,
  organizationMembersInputSchema,
} from "@module/organizations/utils/validation/utils.organization-members.validation";
import { os } from "@orpc/server";
import type { Context } from "../../create-context";
import { protectedProcedure } from "../protected-procedure";

const publicProcedure = os.$context<Context>();

export const organizationsProcedures = {
  list: protectedProcedure
    .input(organizationListInputSchema)
    .handler(({ input, context }) =>
      organizationListController({ input, ctx: context }),
    ),
  getBySlug: protectedProcedure
    .input(organizationGetBySlugInputSchema)
    .handler(({ input, context }) =>
      organizationGetBySlugController({ input, ctx: context }),
    ),
  getProfile: protectedProcedure
    .input(organizationGetProfileInputSchema)
    .handler(({ input, context }) =>
      organizationGetProfileController({ input, ctx: context }),
    ),
  members: protectedProcedure
    .input(organizationMembersInputSchema)
    .handler(({ input, context }) =>
      organizationMembersController({ input, ctx: context }),
    ),
  removeMember: protectedProcedure
    .input(organizationMemberRemoveInputSchema)
    .handler(({ input, context }) =>
      organizationMemberRemoveController({ input, ctx: context }),
    ),
  invitationList: protectedProcedure
    .input(organizationInvitationListInputSchema)
    .handler(({ input, context }) =>
      organizationInvitationListController({ input, ctx: context }),
    ),
  myInvitations: protectedProcedure
    .input(organizationMyInvitationsInputSchema)
    .handler(({ input, context }) =>
      organizationMyInvitationsController({
        input,
        ctx: {
          ...context,
          email: context.session.user.email,
          emailVerified: context.session.user.emailVerified,
        },
      }),
    ),
  invitationCreate: protectedProcedure
    .input(organizationInvitationCreateInputSchema)
    .handler(({ input, context }) =>
      organizationInvitationCreateController({ input, ctx: context }),
    ),
  invitationRevoke: protectedProcedure
    .input(organizationInvitationIdInputSchema)
    .handler(({ input, context }) =>
      organizationInvitationRevokeController({ input, ctx: context }),
    ),
  invitationResend: protectedProcedure
    .input(organizationInvitationIdInputSchema)
    .handler(({ input, context }) =>
      organizationInvitationResendController({ input, ctx: context }),
    ),
  invitationPreview: publicProcedure
    .input(organizationInvitationPreviewInputSchema)
    .handler(({ input }) => organizationInvitationPreviewController({ input })),
  acceptTeamInvitation: protectedProcedure
    .input(organizationInvitationAcceptInputSchema)
    .handler(({ input, context }) =>
      organizationTeamInvitationAcceptController({
        input,
        ctx: context,
        emailVerified: context.session.user.emailVerified,
      }),
    ),
  acceptProjectInvitation: protectedProcedure
    .input(organizationInvitationAcceptInputSchema)
    .handler(({ input, context }) =>
      organizationProjectInvitationAcceptController({
        input,
        ctx: context,
        emailVerified: context.session.user.emailVerified,
      }),
    ),
  settings: protectedProcedure
    .input(organizationSettingsInputSchema)
    .handler(({ input, context }) =>
      organizationSettingsGetController({ input, ctx: context }),
    ),
  updateSettings: protectedProcedure
    .input(organizationSettingsPatchSchema)
    .handler(({ input, context }) =>
      organizationSettingsUpdateController({ input, ctx: context }),
    ),
  updateProfile: protectedProcedure
    .input(organizationProfilePatchSchema)
    .handler(({ input, context }) =>
      organizationProfileUpdateController({ input, ctx: context }),
    ),
  updateBrandingLogo: protectedProcedure
    .input(organizationLogoInputSchema)
    .handler(({ input, context }) =>
      organizationLogoUpdateController({ input, ctx: context }),
    ),
  customRoles: protectedProcedure
    .input(organizationRoleListInputSchema)
    .handler(({ input, context }) =>
      organizationRoleListController({ input, ctx: context }),
    ),
  createCustomRole: protectedProcedure
    .input(organizationRoleCreateInputSchema)
    .handler(({ input, context }) =>
      organizationRoleCreateController({ input, ctx: context }),
    ),
  updateCustomRole: protectedProcedure
    .input(organizationRoleUpdateInputSchema)
    .handler(({ input, context }) =>
      organizationRoleUpdateController({ input, ctx: context }),
    ),
  deleteCustomRole: protectedProcedure
    .input(organizationRoleIdInputSchema)
    .handler(({ input, context }) =>
      organizationRoleDeleteController({ input, ctx: context }),
    ),
  assignCustomRole: protectedProcedure
    .input(organizationRoleAssignInputSchema)
    .handler(({ input, context }) =>
      organizationRoleAssignController({ input, ctx: context }),
    ),
  securityDomains: protectedProcedure
    .input(organizationSecurityDomainListInputSchema)
    .handler(({ input, context }) =>
      organizationSecurityDomainListController({ input, ctx: context }),
    ),
  createSecurityDomain: protectedProcedure
    .input(organizationSecurityDomainCreateInputSchema)
    .handler(({ input, context }) =>
      organizationSecurityDomainCreateController({ input, ctx: context }),
    ),
  verifySecurityDomain: protectedProcedure
    .input(organizationSecurityDomainIdInputSchema)
    .handler(({ input, context }) =>
      organizationSecurityDomainVerifyController({ input, ctx: context }),
    ),
  revokeSecurityDomain: protectedProcedure
    .input(organizationSecurityDomainIdInputSchema)
    .handler(({ input, context }) =>
      organizationSecurityDomainRevokeController({ input, ctx: context }),
    ),
  archive: protectedProcedure
    .input(organizationLifecycleInputSchema)
    .handler(({ input, context }) =>
      organizationArchiveController({ input, ctx: context }),
    ),
  unarchive: protectedProcedure
    .input(organizationLifecycleInputSchema)
    .handler(({ input, context }) =>
      organizationUnarchiveController({ input, ctx: context }),
    ),
  transferOwnership: protectedProcedure
    .input(organizationTransferOwnershipInputSchema)
    .handler(({ input, context }) =>
      organizationTransferOwnershipController({ input, ctx: context }),
    ),
  updateMemberProfile: protectedProcedure
    .input(organizationMemberProfileInputSchema)
    .handler(({ input, context }) =>
      organizationMemberProfileUpdateController({ input, ctx: context }),
    ),
  setMemberSuspended: protectedProcedure
    .input(organizationMemberSuspendInputSchema)
    .handler(({ input, context }) =>
      organizationMemberSetSuspendedController({ input, ctx: context }),
    ),
  memberAccessSummary: protectedProcedure
    .input(organizationMemberIdInputSchema)
    .handler(({ input, context }) =>
      organizationMemberAccessSummaryController({ input, ctx: context }),
    ),
};
