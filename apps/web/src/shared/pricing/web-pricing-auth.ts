import { clientEnv } from "@packages/t3-env/client"

export type WebPricingCheckoutResponse = {
  readonly alreadySubscribed?: boolean
  readonly paymentUrl?: string | null
  readonly planId?: string
  readonly planTier?: "free" | "paid"
  readonly organizationId?: string
  readonly error?: string
  readonly createOrganizationUrl?: string
}

export type WebPricingSubscriptionStatusResponse = {
  readonly authenticated?: boolean
  readonly hasOrganization?: boolean
  readonly hasProduct?: boolean
  readonly planId?: string
  readonly planTier?: "free" | "paid"
  readonly organizationId?: string
  readonly subscriptionStatus?: string
  readonly error?: string
  readonly createOrganizationUrl?: string
}

export type PricingSessionState =
  | { readonly kind: "signed_out" }
  | {
      readonly kind: "signed_in"
      readonly body: WebPricingSubscriptionStatusResponse
    }
  | {
      readonly kind: "needs_organization"
      readonly createOrganizationUrl?: string
    }
  | { readonly kind: "error"; readonly code?: string }

function authAppBase(): string {
  return clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
}

function studioAppBase(): string {
  return (
    clientEnv.NEXT_PUBLIC_STUDIO_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3003"
  )
}

/** Same-origin web proxy; forwards cookies to the auth billing API. */
export function buildBillingApiUrl(path: string): string {
  return path.startsWith("/") ? path : `/${path}`
}

export function buildCreateOrganizationLocation(input: {
  readonly locale: string
  readonly returnTo: string
}): string {
  const url = new URL(`${studioAppBase()}/${input.locale}/onboarding`)
  url.searchParams.set("returnTo", input.returnTo)
  return url.toString()
}

export function buildSignedInContinueLocation(input: {
  readonly locale: string
}): string {
  return `${authAppBase()}/${input.locale}/continue`
}

export async function postPricingCheckout(input: {
  readonly planId: string
  readonly successUrl: string
  readonly cancelUrl: string
  readonly returnTo?: string
  readonly locale: string
}): Promise<{ status: number; body: WebPricingCheckoutResponse }> {
  const response = await fetch(buildBillingApiUrl("/api/billing/checkout"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })
  let body: WebPricingCheckoutResponse = {}
  try {
    body = (await response.json()) as WebPricingCheckoutResponse
  } catch {
    body = { error: "invalid_json" }
  }
  return { status: response.status, body }
}

export async function getPricingSubscriptionStatus(): Promise<{
  status: number
  body: WebPricingSubscriptionStatusResponse
}> {
  const response = await fetch(
    buildBillingApiUrl("/api/billing/subscription-status"),
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  )
  let body: WebPricingSubscriptionStatusResponse = {}
  try {
    body = (await response.json()) as WebPricingSubscriptionStatusResponse
  } catch {
    body = { error: "invalid_json" }
  }
  return { status: response.status, body }
}

/** Never treat a failed status check as signed-out. */
export async function readPricingSession(): Promise<PricingSessionState> {
  try {
    const result = await getPricingSubscriptionStatus()
    if (result.status === 401) {
      if (result.body.error === "unauthenticated") {
        return { kind: "signed_out" }
      }
      return { kind: "error", code: result.body.error ?? "unauthenticated" }
    }
    if (
      result.status === 409 &&
      (result.body.error === "organization_required" ||
        result.body.hasOrganization === false)
    ) {
      return {
        kind: "needs_organization",
        createOrganizationUrl: result.body.createOrganizationUrl,
      }
    }
    if (result.status >= 400) {
      return {
        kind: "error",
        code: result.body.error ?? `http_${result.status}`,
      }
    }
    return { kind: "signed_in", body: result.body }
  } catch {
    return { kind: "error", code: "network" }
  }
}

const resumeStoragePrefix = "loftlancer.pricing.checkout.resume:"

export type PricingResumeGuard = "pending-org" | "completed"

export function pricingResumeStorageKey(planId: string): string {
  return `${resumeStoragePrefix}${planId}`
}

export function readPricingResumeGuard(
  planId: string
): PricingResumeGuard | null {
  if (typeof window === "undefined") return null
  try {
    const value = window.sessionStorage.getItem(pricingResumeStorageKey(planId))
    if (value === "pending-org" || value === "completed") return value
    return null
  } catch {
    return null
  }
}

export function writePricingResumeGuard(
  planId: string,
  value: PricingResumeGuard
): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(pricingResumeStorageKey(planId), value)
  } catch {
    // Private mode or blocked storage must not break checkout.
  }
}
