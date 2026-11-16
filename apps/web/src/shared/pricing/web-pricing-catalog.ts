import type { BillingPlanCatalogEntry } from "@packages/billing"
import { resolveBillingPlanCatalog } from "@packages/billing"
import type { WebPricingPlanView } from "@/shared/pricing/web-pricing-types"

const BYTES_PER_GIB = 1024 * 1024 * 1024

export type { WebPricingPlanView }

export function catalogEntryToPlanView(
  entry: BillingPlanCatalogEntry
): WebPricingPlanView {
  return {
    planId: entry.planId,
    tier: entry.tier,
    quotaGib: Math.max(1, Math.round(entry.quotaBytes / BYTES_PER_GIB)),
    aiEnabled: entry.aiEnabled,
    priceAmount: entry.price.amount,
    currency: entry.price.currency,
    interval: entry.price.interval,
    displayPrimary: entry.price.displayPrimary,
    displaySecondary: entry.price.displaySecondary,
  }
}

export async function loadWebPricingPlans(): Promise<
  readonly WebPricingPlanView[]
> {
  const catalog = await resolveBillingPlanCatalog()
  return catalog.map(catalogEntryToPlanView)
}
