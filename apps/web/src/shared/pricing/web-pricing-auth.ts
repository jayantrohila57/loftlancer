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
}

function authAppBase(): string {
  return clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
}

export function buildBillingApiUrl(path: string): string {
  return `${authAppBase()}${path}`
}

export function buildCreateOrganizationLocation(input: {
  readonly locale: string
  readonly returnTo: string
}): string {
  const url = new URL(`${authAppBase()}/${input.locale}/organizations/create`)
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
