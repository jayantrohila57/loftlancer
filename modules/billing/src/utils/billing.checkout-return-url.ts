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
    const expected =
      kind === "success"
        ? "/billing/checkout/success"
        : "/billing/checkout/cancel"
    if (!url.pathname.endsWith(expected)) return undefined
    return url.toString()
  } catch {
    return undefined
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
