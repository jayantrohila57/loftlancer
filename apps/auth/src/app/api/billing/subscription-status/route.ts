import "@/shared/auth/auth.bootstrap"

import {
  billingReadSubscriptionStatusService,
  resolveCheckoutOrganization,
} from "@modules/billing/server"
import { getAuth } from "@packages/better-auth"
import { billingCorsPreflight, jsonWithCors } from "@/shared/api/auth.cors"

export function OPTIONS(request: Request) {
  return billingCorsPreflight(request)
}

export async function GET(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers })
  if (!session?.user || !session.session) {
    return jsonWithCors(request, { error: "unauthenticated" }, 401)
  }

  const organization = await resolveCheckoutOrganization(session)
  if (!organization.ok) {
    if (organization.code === "database_unavailable") {
      return jsonWithCors(request, { error: organization.code }, 503)
    }
    return jsonWithCors(
      request,
      {
        authenticated: true,
        hasOrganization: organization.code !== "organization_required",
        hasProduct: false,
        error: organization.code,
      },
      organization.code === "owner_required" ? 403 : 409
    )
  }

  try {
    const result = await billingReadSubscriptionStatusService({
      organizationId: organization.organizationId,
    })
    if (!result.ok) {
      return jsonWithCors(request, { error: result.code }, 503)
    }
    return jsonWithCors(request, {
      authenticated: true,
      hasOrganization: true,
      hasProduct: result.hasProduct,
      planId: result.planId,
      planTier: result.planTier,
      organizationId: result.organizationId,
      subscriptionStatus: result.subscriptionStatus,
    })
  } catch {
    return jsonWithCors(request, { error: "status_failed" }, 500)
  }
}
