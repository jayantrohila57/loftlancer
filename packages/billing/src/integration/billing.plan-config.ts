import {
  AUTUMN_DEFAULT_PLAN_ID_FREE,
  AUTUMN_DEFAULT_PLAN_ID_PAID,
  AUTUMN_FEATURE_AI_USAGE_CREDITS,
  AUTUMN_FEATURE_ORG_STORAGE_BYTES,
  AUTUMN_FEATURE_ORGANIZATION_COUNT,
  BILLING_FREE_PLAN_QUOTA_BYTES,
  BILLING_PAID_PLAN_QUOTA_BYTES,
} from "./billing.constants"

/** Display currency for catalog prices. Autumn amount is in major units. */
export const BILLING_DISPLAY_CURRENCY = "usd" as const

/**
 * Placeholder Paid price used until a final list price is chosen.
 * Stripe test product `prod_Vday1PZX3YpEfB` had no readable price from the
 * Codemevel test key, and the sandbox Paid plan had no base price.
 */
export const BILLING_PAID_PRICE_IS_PLACEHOLDER = true
export const BILLING_PAID_PRICE_AMOUNT = 9
export const BILLING_PAID_PRICE_INTERVAL = "month" as const

/** Included AI credits per month on Paid. Free is gated off (0 credits). */
export const BILLING_FREE_AI_CREDITS = 0
export const BILLING_PAID_AI_CREDITS = 1000

/** Owned-organization cap. Free is 1 (approved). Paid default is 10. */
export const BILLING_FREE_ORGANIZATION_COUNT = 1
export const BILLING_PAID_ORGANIZATION_COUNT = 10

/** Days to keep Paid access after a payment failure before downgrade to Free. */
export const BILLING_PAYMENT_GRACE_DAYS = 7

export type BillingFeatureKind = "boolean" | "metered"

export type BillingMeteredFeatureConfig = {
  readonly kind: "metered"
  readonly featureId: string
  readonly included: number
  readonly resetInterval: "month" | null
}

export type BillingBooleanFeatureConfig = {
  readonly kind: "boolean"
  readonly featureId: string
  readonly enabled: boolean
}

export type BillingFeatureConfig =
  | BillingMeteredFeatureConfig
  | BillingBooleanFeatureConfig

export type BillingPlanPriceConfig = {
  readonly amount: number
  readonly currency: typeof BILLING_DISPLAY_CURRENCY
  readonly interval: "month" | null
  readonly isPlaceholder: boolean
}

export type BillingPlanConfig = {
  readonly tier: "free" | "paid"
  readonly defaultPlanId: string
  readonly name: string
  readonly aiEnabled: boolean
  readonly price: BillingPlanPriceConfig
  readonly features: {
    readonly storage: BillingMeteredFeatureConfig
    readonly aiCredits: BillingMeteredFeatureConfig
    readonly organizationCount: BillingMeteredFeatureConfig
  }
}

export const BILLING_FREE_PLAN_CONFIG = {
  tier: "free",
  defaultPlanId: AUTUMN_DEFAULT_PLAN_ID_FREE,
  name: "Free",
  aiEnabled: false,
  price: {
    amount: 0,
    currency: BILLING_DISPLAY_CURRENCY,
    interval: null,
    isPlaceholder: false,
  },
  features: {
    storage: {
      kind: "metered",
      featureId: AUTUMN_FEATURE_ORG_STORAGE_BYTES,
      included: BILLING_FREE_PLAN_QUOTA_BYTES,
      resetInterval: null,
    },
    aiCredits: {
      kind: "metered",
      featureId: AUTUMN_FEATURE_AI_USAGE_CREDITS,
      included: BILLING_FREE_AI_CREDITS,
      resetInterval: "month",
    },
    organizationCount: {
      kind: "metered",
      featureId: AUTUMN_FEATURE_ORGANIZATION_COUNT,
      included: BILLING_FREE_ORGANIZATION_COUNT,
      resetInterval: null,
    },
  },
} as const satisfies BillingPlanConfig

export const BILLING_PAID_PLAN_CONFIG = {
  tier: "paid",
  defaultPlanId: AUTUMN_DEFAULT_PLAN_ID_PAID,
  name: "Paid",
  aiEnabled: true,
  price: {
    amount: BILLING_PAID_PRICE_AMOUNT,
    currency: BILLING_DISPLAY_CURRENCY,
    interval: BILLING_PAID_PRICE_INTERVAL,
    isPlaceholder: BILLING_PAID_PRICE_IS_PLACEHOLDER,
  },
  features: {
    storage: {
      kind: "metered",
      featureId: AUTUMN_FEATURE_ORG_STORAGE_BYTES,
      included: BILLING_PAID_PLAN_QUOTA_BYTES,
      resetInterval: null,
    },
    aiCredits: {
      kind: "metered",
      featureId: AUTUMN_FEATURE_AI_USAGE_CREDITS,
      included: BILLING_PAID_AI_CREDITS,
      resetInterval: "month",
    },
    organizationCount: {
      kind: "metered",
      featureId: AUTUMN_FEATURE_ORGANIZATION_COUNT,
      included: BILLING_PAID_ORGANIZATION_COUNT,
      resetInterval: null,
    },
  },
} as const satisfies BillingPlanConfig

export const BILLING_PLAN_CONFIG_BY_TIER = {
  free: BILLING_FREE_PLAN_CONFIG,
  paid: BILLING_PAID_PLAN_CONFIG,
} as const

export function billingPlanConfigForTier(
  tier: "free" | "paid"
): BillingPlanConfig {
  return BILLING_PLAN_CONFIG_BY_TIER[tier]
}

export const BILLING_USAGE_WARNING_RATIO = 0.8
