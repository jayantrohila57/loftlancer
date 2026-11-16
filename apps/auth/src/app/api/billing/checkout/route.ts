import "@/shared/auth/auth.bootstrap"

import {
  billingStartCheckoutService,
  resolveCheckoutOrganization,
} from "@modules/billing/server"
import { getAuth } from "@packages/better-auth"
import { serverEnv } from "@packages/t3-env/server"
import { z } from "zod"
import { billingCorsPreflight, jsonWithCors } from "@/shared/api/auth.cors"
import { isAllowedBillingReturnUrl } from "@/shared/auth/auth.destination"

const checkoutBodySchema = z.object({
  planId: z.string().min(1).max(128),
  successUrl: z.url(),
  cancelUrl: z.url(),
  returnTo: z.url().optional(),
  locale: z.string().min(2).max(12).optional(),
})

export function OPTIONS(request: Request) {
  return billingCorsPreflight(request)
}

export async function POST(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers })
  if (!session?.user || !session.session) {
    return jsonWithCors(request, { error: "unauthenticated" }, 401)
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return jsonWithCors(request, { error: "invalid_json" }, 400)
  }

  const parsed = checkoutBodySchema.safeParse(json)
  if (!parsed.success) {
    return jsonWithCors(request, { error: "invalid_body" }, 400)
  }

  const { planId, successUrl, cancelUrl, returnTo, locale } = parsed.data
  if (
    !isAllowedBillingReturnUrl(successUrl) ||
    !isAllowedBillingReturnUrl(cancelUrl) ||
    (returnTo && !isAllowedBillingReturnUrl(returnTo))
  ) {
    return jsonWithCors(request, { error: "invalid_return_url" }, 400)
  }

  const organization = await resolveCheckoutOrganization(session)
  if (!organization.ok) {
    if (organization.code === "database_unavailable") {
      return jsonWithCors(request, { error: organization.code }, 503)
    }
    if (organization.code === "organization_required") {
      const lang = locale ?? "en-us"
      const authBase = serverEnv.BETTER_AUTH_URL.replace(/\/$/, "")
      const createUrl = new URL(`${authBase}/${lang}/organizations/create`)
      createUrl.searchParams.set(
        "returnTo",
        returnTo && isAllowedBillingReturnUrl(returnTo) ? returnTo : successUrl
      )
      return jsonWithCors(
        request,
        {
          error: "organization_required",
          createOrganizationUrl: createUrl.toString(),
        },
        409
      )
    }
    if (organization.code === "billing_forbidden") {
      return jsonWithCors(request, { error: "billing_forbidden" }, 403)
    }
    return jsonWithCors(request, { error: organization.code }, 403)
  }

  try {
    const result = await billingStartCheckoutService({
      organizationId: organization.organizationId,
      actorUserId: session.user.id,
      planId,
      successUrl,
      cancelUrl,
    })
    if (!result.ok) {
      const status =
        result.code === "invalid_plan" ||
        result.code === "free_plan_no_checkout"
          ? 400
          : 503
      return jsonWithCors(request, { error: result.code }, status)
    }
    return jsonWithCors(request, {
      alreadySubscribed: result.alreadySubscribed,
      paymentUrl: result.paymentUrl,
      planId: result.planId,
      planTier: result.planTier,
      organizationId: result.organizationId,
    })
  } catch {
    return jsonWithCors(request, { error: "checkout_failed" }, 500)
  }
}
