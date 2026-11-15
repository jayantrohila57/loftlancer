export type BillingPaymentMethodSummary = {
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

export function summarizePaymentMethod(
  paymentMethod: unknown
): BillingPaymentMethodSummary | null {
  if (!paymentMethod || typeof paymentMethod !== "object") return null
  const record = paymentMethod as Record<string, unknown>
  const card =
    record.card && typeof record.card === "object"
      ? (record.card as Record<string, unknown>)
      : null
  if (!card) return null

  const brand =
    typeof card.brand === "string" && card.brand.length > 0
      ? card.brand
      : "card"
  const last4 =
    typeof card.last4 === "string" && card.last4.length > 0
      ? card.last4
      : "????"
  const expMonth =
    typeof card.exp_month === "number"
      ? card.exp_month
      : typeof card.expMonth === "number"
        ? card.expMonth
        : null
  const expYear =
    typeof card.exp_year === "number"
      ? card.exp_year
      : typeof card.expYear === "number"
        ? card.expYear
        : null

  if (expMonth === null || expYear === null) return null

  return { brand, last4, expMonth, expYear }
}
