import type { BetterAuthOrganizationPluginOptions } from "@packages/better-auth"
import { APIError } from "@packages/better-auth"
import { logger } from "@packages/logger/server"
import {
  parseOrganizationMetadataSetup,
  validateCreateOrganizationInput,
} from "../../utils/validation/org.create.schema"
import { invitationAssignsOwnerRole } from "../../utils/validation/org.invitation-role"

import {
  assertUserCanCreateOwnedOrg,
  provisionOrganizationOnCreate,
} from "../services/org.service.provisioning"
import { sendOrgInvitationEmail } from "./org.invitation-email"
import {
  orgOrganizationAccessControl,
  orgOrganizationPluginRoles,
} from "./org.organization-roles"

const ORG_INVITATION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7

function assertInvitationRoleIsNotOwner(role: string) {
  if (invitationAssignsOwnerRole(role)) {
    throw APIError.from("FORBIDDEN", {
      code: "ORG_INVITE_OWNER_NOT_ALLOWED",
      message: "org.invite_owner_not_allowed",
    })
  }
}

/** Better Auth `organization()` options wired from `configureBetterAuth`. */
export function buildOrgOrganizationPluginOptions(): BetterAuthOrganizationPluginOptions {
  return {
    ac: orgOrganizationAccessControl as BetterAuthOrganizationPluginOptions["ac"],
    allowUserToCreateOrganization: true,
    invitationExpiresIn: ORG_INVITATION_EXPIRES_IN_SECONDS,
    requireEmailVerificationOnInvitation: true,
    roles: orgOrganizationPluginRoles,
    async sendInvitationEmail(data) {
      await sendOrgInvitationEmail({
        email: data.email,
        organization: data.organization,
      })
    },
    organizationHooks: {
      async beforeCreateInvitation(data) {
        assertInvitationRoleIsNotOwner(data.invitation.role)
      },
      async beforeAcceptInvitation(data) {
        assertInvitationRoleIsNotOwner(data.invitation.role)
      },
      async beforeUpdateMemberRole(data) {
        assertInvitationRoleIsNotOwner(data.newRole)
      },
      async beforeCreateOrganization(data) {
        const rawMetadata = data.organization.metadata
        const metadata =
          typeof rawMetadata === "string"
            ? (JSON.parse(rawMetadata) as { setup?: unknown })
            : (rawMetadata as { setup?: unknown } | null)
        const validated = validateCreateOrganizationInput({
          name: data.organization.name ?? "",
          slug: data.organization.slug ?? "",
          logo: data.organization.logo ?? undefined,
          setup: metadata?.setup ?? rawMetadata,
        })
        if (!validated.success) {
          throw APIError.from("BAD_REQUEST", {
            code: "INVALID_ORGANIZATION_SETUP",
            message: "Invalid organization details",
          })
        }
        await assertUserCanCreateOwnedOrg({ userId: data.user.id })
      },
      async afterCreateOrganization(data) {
        const metadata =
          typeof data.organization.metadata === "string"
            ? JSON.parse(data.organization.metadata)
            : data.organization.metadata
        const setup = parseOrganizationMetadataSetup(metadata?.setup)
        if (!setup) {
          throw APIError.from("BAD_REQUEST", {
            code: "INVALID_ORGANIZATION_SETUP",
            message: "Missing organization setup",
          })
        }
        try {
          await provisionOrganizationOnCreate({
            organizationId: data.organization.id,
            setup,
            organizationName: data.organization.name,
            ownerEmail: data.user.email,
          })
        } catch (error) {
          logger.error("org.provision.after_create_failed", {
            app: "auth",
            module: "org",
            outcome: "error",
            errorCode: "org_provision_after_create_failed",
            output: {
              organizationId: data.organization.id,
              userId: data.user.id,
              message: error instanceof Error ? error.message : "unknown",
            },
          })
        }
      },
    },
  }
}
