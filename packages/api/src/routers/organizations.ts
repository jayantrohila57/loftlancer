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
  organizationLogoInputSchema,
  organizationMemberIdInputSchema,
  organizationMemberProfileInputSchema,
  organizationMemberSuspendInputSchema,
  organizationProfilePatchSchema,
  organizationRoleAssignInputSchema,
  organizationRoleCreateInputSchema,
  organizationRoleIdInputSchema,
  organizationRoleUpdateInputSchema,
  organizationSecurityDomainCreateInputSchema,
  organizationSecurityDomainIdInputSchema,
  organizationSettingsPatchSchema,
  organizationTransferOwnershipInputSchema,
} from "@module/organizations/utils/validation/utils.organization-admin.validation";
import { organizationGetBySlugInputSchema } from "@module/organizations/utils/validation/utils.organization-get-by-slug.validation";
import {
  organizationInvitationAcceptInputSchema,
  organizationInvitationCreateInputSchema,
  organizationInvitationIdInputSchema,
  organizationInvitationListInputSchema,
  organizationInvitationPreviewInputSchema,
  organizationProjectInvitationIdInputSchema,
  organizationProjectInvitationListInputSchema,
} from "@module/organizations/utils/validation/utils.organization-invitations.validation";
import { organizationMemberRemoveInputSchema } from "@module/organizations/utils/validation/utils.organization-members.validation";
import type { ServiceResponse } from "@module/shared/utils/types/utils.service-response.types";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import {
  orgAwareProcedure,
  orgProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../index";

type OrganizationContext = {
  session: {
    user: {
      id: string;
      email: string;
      emailVerified: boolean;
      name?: string | null;
    };
  };
  activeOrganizationId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function controllerContext(ctx: OrganizationContext) {
  return {
    userId: ctx.session.user.id,
    orgId: ctx.activeOrganizationId,
    ip: ctx.ipAddress,
    userAgent: ctx.userAgent,
  };
}

async function unwrap<T>(
  result: ServiceResponse<T> | Promise<ServiceResponse<T>>,
): Promise<T> {
  const response = await result;
  if (response.status === "success" && response.data !== null) {
    return response.data as T;
  }
  throw new TRPCError({
    code: response.status === "error" ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST",
    message: response.message,
  });
}

/** Compatibility transport. Native clients use the controllers' ServiceResponse. */
export const organizationsRouter = router({
  updateMemberProfile: orgProcedure
    .input(organizationMemberProfileInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationMemberProfileUpdateController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  setMemberSuspended: orgProcedure
    .input(organizationMemberSuspendInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationMemberSetSuspendedController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  listCustomRoles: orgProcedure.query(({ ctx }) =>
    unwrap(
      organizationRoleListController({
        input: {},
        ctx: controllerContext(ctx),
      }),
    ),
  ),
  createCustomRole: orgProcedure
    .input(organizationRoleCreateInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationRoleCreateController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  assignCustomRole: orgProcedure
    .input(organizationRoleAssignInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationRoleAssignController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  updateCustomRole: orgProcedure
    .input(organizationRoleUpdateInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationRoleUpdateController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  deleteCustomRole: orgProcedure
    .input(organizationRoleIdInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationRoleDeleteController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  transferOwnership: orgProcedure
    .input(organizationTransferOwnershipInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationTransferOwnershipController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  getInvitationPreview: publicProcedure
    .input(organizationInvitationPreviewInputSchema)
    .query(({ input }) =>
      unwrap(organizationInvitationPreviewController({ input })),
    ),
  acceptTeamInvitation: protectedProcedure
    .input(organizationInvitationAcceptInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationTeamInvitationAcceptController({
          input,
          ctx: controllerContext(ctx),
          emailVerified: ctx.session.user.emailVerified,
        }),
      ),
    ),
  acceptProjectInvitation: protectedProcedure
    .input(organizationInvitationAcceptInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationProjectInvitationAcceptController({
          input,
          ctx: controllerContext(ctx),
          emailVerified: ctx.session.user.emailVerified,
        }),
      ),
    ),
  inviteToProject: orgProcedure
    .input(
      z.object({ projectId: z.string().min(1), email: z.string().email() }),
    )
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationInvitationCreateController({
          input: {
            organizationId: ctx.activeOrganizationId,
            projectId: input.projectId,
            email: input.email,
            role: "member",
          },
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  listProjectInvitations: orgProcedure
    .input(organizationProjectInvitationListInputSchema)
    .use(
      actionGuard("project.read", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .query(({ ctx, input }) =>
      unwrap(
        organizationProjectInvitationListController({
          input,
          ctx: controllerContext(ctx),
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
      unwrap(
        organizationInvitationRevokeController({
          input,
          ctx: controllerContext(ctx),
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
      unwrap(
        organizationInvitationResendController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  listMyInvitations: protectedProcedure.query(({ ctx }) =>
    unwrap(
      organizationMyInvitationsController({
        input: {},
        ctx: {
          ...controllerContext(ctx),
          email: ctx.session.user.email,
          emailVerified: ctx.session.user.emailVerified,
        },
      }),
    ),
  ),
  resendInvitation: orgProcedure
    .input(organizationInvitationIdInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationInvitationResendController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  createInvitation: orgProcedure
    .input(organizationInvitationCreateInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationInvitationCreateController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  revokeInvitation: orgProcedure
    .input(organizationInvitationIdInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationInvitationRevokeController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  list: protectedProcedure.query(({ ctx }) =>
    unwrap(
      organizationListController({
        input: {},
        ctx: {
          userId: ctx.session.user.id,
          ip: ctx.ipAddress,
          userAgent: ctx.userAgent,
        },
      }),
    ),
  ),
  getBySlug: orgAwareProcedure
    .input(organizationGetBySlugInputSchema)
    .query(({ ctx, input }) =>
      unwrap(
        organizationGetBySlugController({ input, ctx: controllerContext(ctx) }),
      ),
    ),
  getProfile: orgProcedure.query(({ ctx }) =>
    unwrap(
      organizationGetProfileController({
        input: {},
        ctx: controllerContext(ctx),
      }),
    ),
  ),
  updateBrandingLogo: orgProcedure
    .input(organizationLogoInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationLogoUpdateController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  updateProfile: orgProcedure
    .input(organizationProfilePatchSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationProfileUpdateController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  getSettings: orgProcedure.query(({ ctx }) =>
    unwrap(
      organizationSettingsGetController({
        input: {},
        ctx: controllerContext(ctx),
      }),
    ),
  ),
  updateSettings: orgProcedure
    .input(organizationSettingsPatchSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationSettingsUpdateController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  listSecurityDomains: orgProcedure.query(({ ctx }) =>
    unwrap(
      organizationSecurityDomainListController({
        input: {},
        ctx: controllerContext(ctx),
      }),
    ),
  ),
  createSecurityDomain: orgProcedure
    .input(organizationSecurityDomainCreateInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationSecurityDomainCreateController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  verifySecurityDomain: orgProcedure
    .input(organizationSecurityDomainIdInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationSecurityDomainVerifyController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  revokeSecurityDomain: orgProcedure
    .input(organizationSecurityDomainIdInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationSecurityDomainRevokeController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  archive: orgProcedure.mutation(({ ctx }) =>
    unwrap(
      organizationArchiveController({ input: {}, ctx: controllerContext(ctx) }),
    ),
  ),
  unarchive: orgProcedure.mutation(({ ctx }) =>
    unwrap(
      organizationUnarchiveController({
        input: {},
        ctx: controllerContext(ctx),
      }),
    ),
  ),
  listMembers: orgProcedure.query(({ ctx }) =>
    unwrap(
      organizationMembersController({
        input: {},
        ctx: controllerContext(ctx),
      }),
    ),
  ),
  getMemberAccessSummary: orgProcedure
    .input(organizationMemberIdInputSchema)
    .query(({ ctx, input }) =>
      unwrap(
        organizationMemberAccessSummaryController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  removeMember: orgProcedure
    .input(organizationMemberRemoveInputSchema)
    .mutation(({ ctx, input }) =>
      unwrap(
        organizationMemberRemoveController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
  listInvitations: orgProcedure
    .input(organizationInvitationListInputSchema)
    .query(({ ctx, input }) =>
      unwrap(
        organizationInvitationListController({
          input,
          ctx: controllerContext(ctx),
        }),
      ),
    ),
});
