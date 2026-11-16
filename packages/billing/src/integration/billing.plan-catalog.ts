import type { ListPlansList } from "autumn-js"
import { getAutumnClient, isAutumnConfigured } from "./billing.autumn-client"
import {
  BILLING_DISPLAY_CURRENCY,
  BILLING_FREE_PLAN_CONFIG,
  BILLING_PAID_PLAN_CONFIG,
} from "./billing.plan-config"
import {
  resolveAutumnPlanIdFree,
  resolveAutumnPlanIdPaid,
} from "./billing.plan-ids"

export type BillingPlanCatalogPrice = {
  amount: number | null
  currency: string | null
  interval: string | null
  displayPrimary: string | null
  displaySecondary: string | null
}

export type BillingPlanCatalogEntry = {
  planId: string
  tier: "free" | "paid"
  quotaBytes: number
  aiEnabled: boolean
  price: BillingPlanCatalogPrice
}

function priceFromAutumnPlan(
  autumnPlan: ListPlansList | undefined
): BillingPlanCatalogPrice {
  const base = autumnPlan?.price ?? null
  if (!base) {
    return {
      amount: null,
      currency: null,
      interval: null,
      displayPrimary: null,
      displaySecondary: null,
    }
  }

  return {
    amount: typeof base.amount === "number" ? base.amount : null,
    currency: BILLING_DISPLAY_CURRENCY,
    interval: base.interval ?? null,
    displayPrimary: base.display?.primaryText ?? null,
    displaySecondary: base.display?.secondaryText ?? null,
  }
}

export function buildProductPlanCatalog(): BillingPlanCatalogEntry[] {
  const free = BILLING_FREE_PLAN_CONFIG
  const paid = BILLING_PAID_PLAN_CONFIG
  return [
    {
      planId: resolveAutumnPlanIdFree(),
      tier: "free",
      quotaBytes: free.features.storage.included,
      aiEnabled: free.aiEnabled,
      price: {
        amount: free.price.amount,
        currency: free.price.currency,
        interval: free.price.interval,
        displayPrimary: null,
        displaySecondary: null,
      },
    },
    {
      planId: resolveAutumnPlanIdPaid(),
      tier: "paid",
      quotaBytes: paid.features.storage.included,
      aiEnabled: paid.aiEnabled,
      price: {
        amount: paid.price.amount,
        currency: paid.price.currency,
        interval: paid.price.interval,
        displayPrimary: null,
        displaySecondary: null,
      },
    },
  ]
}

export function mergeAutumnCatalogPrices(
  catalog: BillingPlanCatalogEntry[],
  autumnPlans: readonly ListPlansList[]
): BillingPlanCatalogEntry[] {
  const byId = new Map<string, ListPlansList>()
  for (const plan of autumnPlans) {
    if (plan.archived || plan.addOn) continue
    const existing = byId.get(plan.id)
    if (!existing || (plan.active && !existing.active)) {
      byId.set(plan.id, plan)
    }
  }

  return catalog.map((entry) => {
    const autumn = byId.get(entry.planId)
    const mergedPrice = priceFromAutumnPlan(autumn)
    if (
      mergedPrice.amount === null &&
      mergedPrice.displayPrimary === null &&
      entry.tier === "free"
    ) {
      return {
        ...entry,
        price: entry.price,
      }
    }
    if (mergedPrice.amount === null && mergedPrice.displayPrimary === null) {
      return entry
    }
    return {
      ...entry,
      price: {
        ...entry.price,
        ...mergedPrice,
        currency: mergedPrice.currency ?? entry.price.currency,
        interval: mergedPrice.interval ?? entry.price.interval,
      },
    }
  })
}

export async function listAutumnPlansForCatalog(): Promise<ListPlansList[]> {
  if (!isAutumnConfigured()) return []
  const client = getAutumnClient()
  if (!client) return []
  try {
    const response = await client.plans.list()
    return response.list ?? []
  } catch {
    return []
  }
}

export async function resolveBillingPlanCatalog(): Promise<
  BillingPlanCatalogEntry[]
> {
  const base = buildProductPlanCatalog()
  const autumnPlans = await listAutumnPlansForCatalog()
  if (autumnPlans.length === 0) return base
  return mergeAutumnCatalogPrices(base, autumnPlans)
}
