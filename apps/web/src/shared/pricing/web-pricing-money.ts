import type { WebPricingPlanView } from "@/shared/pricing/web-pricing-types"

export type WebPricingPriceLabels = {
  readonly priceFree: string
  readonly priceUnavailable: string
  readonly intervalMonth: string
  readonly intervalYear: string
  readonly intervalOnce: string
  readonly pricePerInterval: (values: {
    price: string
    interval: string
  }) => string
}

export function formatPricingAmount(input: {
  readonly amount: number
  readonly currency: string
  readonly locale: string
}): string {
  const locale = input.locale.replace("_", "-")
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: input.currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(input.amount)
}

export function formatPlanPriceLabel(
  plan: WebPricingPlanView,
  locale: string,
  labels: WebPricingPriceLabels
): string {
  if (plan.tier === "free") return labels.priceFree
  const interval = intervalLabel(plan.interval, labels)
  if (plan.displayPrimary) {
    if (interval && !plan.displaySecondary) {
      return labels.pricePerInterval({
        price: plan.displayPrimary,
        interval,
      })
    }
    if (plan.displaySecondary) {
      return `${plan.displayPrimary} ${plan.displaySecondary}`
    }
    return plan.displayPrimary
  }
  if (plan.priceAmount != null && plan.currency) {
    const price = formatPricingAmount({
      amount: plan.priceAmount,
      currency: plan.currency,
      locale,
    })
    if (interval) {
      return labels.pricePerInterval({ price, interval })
    }
    return price
  }
  return labels.priceUnavailable
}

function intervalLabel(
  interval: string | null,
  labels: Pick<
    WebPricingPriceLabels,
    "intervalMonth" | "intervalYear" | "intervalOnce"
  >
): string | null {
  if (!interval) return null
  if (interval === "month") return labels.intervalMonth
  if (interval === "year") return labels.intervalYear
  if (interval === "one_off" || interval === "one-time") {
    return labels.intervalOnce
  }
  return interval
}
