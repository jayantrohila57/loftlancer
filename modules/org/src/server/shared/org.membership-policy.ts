import { APIError } from "@packages/better-auth"
import { getDb } from "@packages/drizzle"
import { member } from "@packages/drizzle/schema"
import { and, eq } from "drizzle-orm"

import {
  ORG_PLUGIN_ADMIN_ROLE,
  parseOrganizationRoleList,
  resolveOrgProductRole,
} from "../../shared/org.organization-access-control"
import { ORG_OWNER_MEMBER_ROLE } from "../../utils/constants/org.constants.entitlements"
import { invitationAssignsOwnerRole } from "../../utils/validation/org.invitation-role"
import { readOrgAuthActorUserId } from "./org.auth-request-context"

function roleIsOwner(role: string) {
  return parseOrganizationRoleList(role).includes(ORG_OWNER_MEMBER_ROLE)
}

function roleIsAdmin(role: string) {
  return parseOrganizationRoleList(role).includes(ORG_PLUGIN_ADMIN_ROLE)
}

function roleIsElevated(role: string) {
  return roleIsOwner(role) || roleIsAdmin(role)
}

function assertRolePluginValueAllowedForActor(
  actorRole: string,
  nextRole: string
) {
  if (invitationAssignsOwnerRole(nextRole)) {
    throw APIError.from("FORBIDDEN", {
      code: "ORG_INVITE_OWNER_NOT_ALLOWED",
      message: "org.invite_owner_not_allowed",
    })
  }
  const productRole = resolveOrgProductRole(actorRole)
  if (productRole === "owner" || productRole === "admin") return
  if (productRole === "manager") {
    if (
      parseOrganizationRoleList(nextRole).includes(ORG_PLUGIN_ADMIN_ROLE) ||
      invitationAssignsOwnerRole(nextRole)
    ) {
      throw APIError.from("FORBIDDEN", {
        code: "ORG_ROLE_ASSIGN_FORBIDDEN",
        message: "org.role_assign_forbidden",
      })
    }
    return
  }
  throw APIError.from("FORBIDDEN", {
    code: "ORG_ROLE_ASSIGN_FORBIDDEN",
    message: "org.role_assign_forbidden",
  })
}

async function readActorMembershipRole(
  organizationId: string,
  actorUserId: string
): Promise<string | null> {
  const db = getDb()
  if (!db) return null
  const [row] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, organizationId),
        eq(member.userId, actorUserId)
      )
    )
    .limit(1)
  return row?.role ?? null
}

export async function resolveOrgMembershipActorRole(input: {
  organizationId: string
  inviterId?: string
}): Promise<string | null> {
  const actorUserId = input.inviterId ?? readOrgAuthActorUserId()
  if (!actorUserId) return null
  return readActorMembershipRole(input.organizationId, actorUserId)
}

export function assertInvitationRolePolicy(input: {
  actorRole: string
  invitationRole: string
}) {
  assertRolePluginValueAllowedForActor(input.actorRole, input.invitationRole)
}

export function assertMemberRoleUpdatePolicy(input: {
  actorRole: string
  targetCurrentRole: string
  nextRole: string
}) {
  assertRolePluginValueAllowedForActor(input.actorRole, input.nextRole)
  const actorProductRole = resolveOrgProductRole(input.actorRole)
  if (
    actorProductRole === "manager" &&
    roleIsElevated(input.targetCurrentRole)
  ) {
    throw APIError.from("FORBIDDEN", {
      code: "ORG_MEMBER_ELEVATED_FORBIDDEN",
      message: "org.member_elevated_forbidden",
    })
  }
  if (actorProductRole === "manager" && roleIsAdmin(input.nextRole)) {
    throw APIError.from("FORBIDDEN", {
      code: "ORG_ROLE_ASSIGN_FORBIDDEN",
      message: "org.role_assign_forbidden",
    })
  }
}

export function assertMemberRemovalPolicy(input: {
  actorRole: string
  targetRole: string
}) {
  const actorProductRole = resolveOrgProductRole(input.actorRole)
  if (actorProductRole === "manager" && roleIsElevated(input.targetRole)) {
    throw APIError.from("FORBIDDEN", {
      code: "ORG_MEMBER_ELEVATED_FORBIDDEN",
      message: "org.member_elevated_forbidden",
    })
  }
}
