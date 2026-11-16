import { canManageOrganizationBilling } from "@modules/org/utils/org.member-role"
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
        | "billing_forbidden"
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

  const rows = await db
    .select({
      organizationId: member.organizationId,
      role: member.role,
    })
    .from(member)
    .where(eq(member.userId, userId))

  const billingOrganizations = rows.filter((row) =>
    canManageOrganizationBilling(row.role)
  )

  if (billingOrganizations.length === 0) {
    const activeOrganizationId = readActiveOrganizationId(auth)
    if (activeOrganizationId) {
      return { ok: false, code: "billing_forbidden" }
    }
    return { ok: false, code: "organization_required" }
  }

  const billingIds = new Set(
    billingOrganizations.map((row) => row.organizationId)
  )
  const activeOrganizationId = readActiveOrganizationId(auth)
  if (activeOrganizationId) {
    if (billingIds.has(activeOrganizationId)) {
      return { ok: true, organizationId: activeOrganizationId }
    }
    return { ok: false, code: "billing_forbidden" }
  }

  const first = billingOrganizations[0]
  if (!first) {
    return { ok: false, code: "organization_required" }
  }
  return { ok: true, organizationId: first.organizationId }
}
