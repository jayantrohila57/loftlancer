import { proxyAuthBillingRequest } from "@/shared/pricing/web-pricing-billing-proxy"

export async function GET(request: Request) {
  return proxyAuthBillingRequest(request, "/api/billing/subscription-status")
}
