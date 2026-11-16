import { ORG_OWNER_MEMBER_ROLE } from "@modules/org/utils/constants/org.constants.entitlements"
import { readActiveOrganizationId } from "@modules/org/utils/org.session"
import { getDb } from "@packages/drizzle"
import { member } from "@packages/drizzle/schema"
import { and, eq } from "drizzle-orm"

export type CheckoutOrganizationResolution =
  | { readonly ok: true; readonly organizationId: string }
  | {
      readonly ok: false
      readonly code:
        | "database_unavailable"
        | "organization_required"
        | "owner_required"
    }

type CheckoutSessionCarrier = {
  readonly user?: { readonly id: string } | null
  readonly session?: {
    readonly activeOrganizationId?: string | null
    readonly [key: string]: unknown
  } | null
}

export async function resolveCheckoutOrganization(
  auth: CheckoutSessionCarrier
): Promise<CheckoutOrganizationResolution> {
  const userId = auth.user?.id
  if (!userId) {
    return { ok: false, code: "organization_required" }
  }

  const db = getDb()
  if (!db) {
    return { ok: false, code: "database_unavailable" }
  }

  const owned = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(
      and(eq(member.userId, userId), eq(member.role, ORG_OWNER_MEMBER_ROLE))
    )

  if (owned.length === 0) {
    const activeOrganizationId = readActiveOrganizationId(auth)
    if (activeOrganizationId) {
      return { ok: false, code: "owner_required" }
    }
    return { ok: false, code: "organization_required" }
  }

  const ownedIds = new Set(owned.map((row) => row.organizationId))
  const activeOrganizationId = readActiveOrganizationId(auth)
  if (activeOrganizationId) {
    if (ownedIds.has(activeOrganizationId)) {
      return { ok: true, organizationId: activeOrganizationId }
    }
    return { ok: false, code: "owner_required" }
  }

  const firstOwned = owned[0]
  if (!firstOwned) {
    return { ok: false, code: "organization_required" }
  }
  return { ok: true, organizationId: firstOwned.organizationId }
}
