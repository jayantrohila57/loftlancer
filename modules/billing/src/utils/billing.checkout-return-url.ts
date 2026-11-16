export function readBillingCheckoutReturnUrl(
  value: string | undefined,
  kind: "success" | "cancel"
): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    if (
      url.username ||
      url.password ||
      !["http:", "https:"].includes(url.protocol)
    ) {
      return undefined
    }
    const successSuffixes = [
      "/billing/checkout/success",
      "/onboarding/plan/checkout/success",
    ]
    const cancelSuffixes = [
      "/billing/checkout/cancel",
      "/onboarding/plan/checkout/cancel",
    ]
    const allowed =
      kind === "success"
        ? successSuffixes.some((suffix) => url.pathname.endsWith(suffix))
        : cancelSuffixes.some((suffix) => url.pathname.endsWith(suffix))
    if (!allowed) return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

export function studioOnboardingPlanCheckoutReturnUrls(input: {
  origin: string
  lang: string
}): { successUrl: string; cancelUrl: string } {
  const base = `${input.origin.replace(/\/$/, "")}/${input.lang}/onboarding/plan/checkout`
  return {
    successUrl: `${base}/success`,
    cancelUrl: `${base}/cancel`,
  }
}

export function billingCheckoutReturnUrlsFromLocation(href: string): {
  successUrl?: string
  cancelUrl?: string
} {
  try {
    const url = new URL(href)
    const marker = "/settings/"
    const index = url.pathname.indexOf(marker)
    if (index === -1) return {}
    const after = url.pathname.slice(index + marker.length)
    const slug = after.split("/").filter(Boolean)[0]
    if (!slug) return {}
    const prefix = url.pathname.slice(0, index)
    const base = `${url.origin}${prefix}/settings/${slug}/billing/checkout`
    return {
      successUrl: `${base}/success`,
      cancelUrl: `${base}/cancel`,
    }
  } catch {
    return {}
  }
}
