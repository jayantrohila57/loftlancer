import { buildAuthSignInLocation } from "@modules/auth"
import type { PricingSessionState } from "@/shared/pricing/web-pricing-auth"
import {
  buildCreateOrganizationLocation,
  postPricingCheckout,
  readPricingResumeGuard,
  readPricingSession,
  writePricingResumeGuard,
} from "@/shared/pricing/web-pricing-auth"
import type { WebPricingPlanView } from "@/shared/pricing/web-pricing-types"

export type PricingCheckoutMessageKey =
  | "errorGeneric"
  | "errorBillingUnavailable"
  | "errorOrganizationRequired"
  | "errorOwnerRequired"
  | "errorAlreadySubscribed"
  | "errorSessionCheck"

export type PricingCheckoutResult =
  | { readonly kind: "redirect"; readonly url: string }
  | { readonly kind: "message"; readonly key: PricingCheckoutMessageKey }

export function pricingReturnTo(locale: string, planId: string): string {
  return `${window.location.origin}/${locale}/pricing?plan=${encodeURIComponent(planId)}`
}

export function checkoutErrorMessageKey(
  code: string | undefined
): PricingCheckoutMessageKey {
  if (code === "organization_required") return "errorOrganizationRequired"
  if (code === "owner_required") return "errorOwnerRequired"
  if (code === "already_subscribed") return "errorAlreadySubscribed"
  if (
    code === "autumn_unconfigured" ||
    code === "autumn_unavailable" ||
    code === "database_unavailable"
  ) {
    return "errorBillingUnavailable"
  }
  if (
    code === "network" ||
    code === "invalid_json" ||
    code === "status_failed" ||
    code === "unauthenticated"
  ) {
    return "errorSessionCheck"
  }
  return "errorGeneric"
}

function organizationCreateUrl(
  locale: string,
  planId: string,
  session: PricingSessionState
): string {
  if (session.kind === "needs_organization" && session.createOrganizationUrl) {
    return session.createOrganizationUrl
  }
  return buildCreateOrganizationLocation({
    locale,
    returnTo: pricingReturnTo(locale, planId),
  })
}

export async function startPaidCheckoutFlow(input: {
  readonly locale: string
  readonly plan: WebPricingPlanView
  readonly source: "click" | "resume"
}): Promise<PricingCheckoutResult> {
  const { locale, plan, source } = input
  const session = await readPricingSession()

  if (session.kind === "error") {
    return { kind: "message", key: checkoutErrorMessageKey(session.code) }
  }

  if (session.kind === "signed_out") {
    if (source === "resume") {
      return { kind: "message", key: "errorSessionCheck" }
    }
    return {
      kind: "redirect",
      url: buildAuthSignInLocation({
        locale,
        returnTo: pricingReturnTo(locale, plan.planId),
      }),
    }
  }

  if (session.kind === "needs_organization") {
    if (
      source === "resume" &&
      readPricingResumeGuard(plan.planId) === "pending-org"
    ) {
      writePricingResumeGuard(plan.planId, "completed")
      return { kind: "message", key: "errorOrganizationRequired" }
    }
    writePricingResumeGuard(plan.planId, "pending-org")
    return {
      kind: "redirect",
      url: organizationCreateUrl(locale, plan.planId, session),
    }
  }

  const origin = window.location.origin
  const successUrl = `${origin}/${locale}/billing/success?plan=${encodeURIComponent(plan.planId)}`
  const cancelUrl = `${origin}/${locale}/billing/cancel?plan=${encodeURIComponent(plan.planId)}`

  try {
    const result = await postPricingCheckout({
      planId: plan.planId,
      successUrl,
      cancelUrl,
      returnTo: pricingReturnTo(locale, plan.planId),
      locale,
    })

    if (
      result.status === 409 &&
      (result.body.createOrganizationUrl ||
        result.body.error === "organization_required")
    ) {
      if (
        source === "resume" &&
        readPricingResumeGuard(plan.planId) === "pending-org"
      ) {
        writePricingResumeGuard(plan.planId, "completed")
        return { kind: "message", key: "errorOrganizationRequired" }
      }
      writePricingResumeGuard(plan.planId, "pending-org")
      return {
        kind: "redirect",
        url:
          result.body.createOrganizationUrl ||
          buildCreateOrganizationLocation({
            locale,
            returnTo: pricingReturnTo(locale, plan.planId),
          }),
      }
    }
    if (result.body.error === "owner_required") {
      writePricingResumeGuard(plan.planId, "completed")
      return { kind: "message", key: "errorOwnerRequired" }
    }
    if (result.body.alreadySubscribed) {
      writePricingResumeGuard(plan.planId, "completed")
      return { kind: "redirect", url: successUrl }
    }
    if (result.body.paymentUrl) {
      writePricingResumeGuard(plan.planId, "completed")
      return { kind: "redirect", url: result.body.paymentUrl }
    }
    // A 401 here after a successful session check is not treated as signed-out.
    writePricingResumeGuard(plan.planId, "completed")
    return { kind: "message", key: checkoutErrorMessageKey(result.body.error) }
  } catch {
    writePricingResumeGuard(plan.planId, "completed")
    return { kind: "message", key: "errorGeneric" }
  }
}
