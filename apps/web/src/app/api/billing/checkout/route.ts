import { proxyAuthBillingRequest } from "@/shared/pricing/web-pricing-billing-proxy"

export async function POST(request: Request) {
  return proxyAuthBillingRequest(request, "/api/billing/checkout")
}
