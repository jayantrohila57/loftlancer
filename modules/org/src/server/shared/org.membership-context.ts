import { ORG_OWNER_MEMBER_ROLE } from "@modules/org/utils/constants/org.constants.entitlements"
import { readActiveOrganizationId } from "@modules/org/utils/org.session"
import { getDb } from "@packages/drizzle"
import { member } from "@packages/drizzle/schema"
import { ORPCError } from "@packages/orpc/server"
import { and, eq } from "drizzle-orm"

export type ActiveOrgMembershipContext = {
  readonly organizationId: string
  readonly orgRole: string
  readonly isOrgOwner: boolean
}

export type ActiveOrgMembershipAuth = Parameters<
  typeof readActiveOrganizationId
>[0] & {
  readonly user: { readonly id: string }
}

/** Session-scoped active org + membership — never trust client-supplied org ids. */
export async function resolveActiveOrgMembershipContext(
  auth: ActiveOrgMembershipAuth
): Promise<ActiveOrgMembershipContext> {
  const organizationId = readActiveOrganizationId(auth)
  if (!organizationId) {
    throw new ORPCError("FORBIDDEN", {
      message: "Select an organization to continue.",
      data: { code: "auth.no_active_org" },
    })
  }

  const db = getDb()
  if (!db) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  }

  const [membership] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, organizationId),
        eq(member.userId, auth.user.id)
      )
    )
    .limit(1)

  if (!membership) {
    throw new ORPCError("FORBIDDEN", {
      message: "You are not a member of this organization.",
      data: { code: "rbac.not_member" },
    })
  }

  const orgRole = membership.role
  const isOrgOwner = orgRole === ORG_OWNER_MEMBER_ROLE

  return { organizationId, orgRole, isOrgOwner }
}
