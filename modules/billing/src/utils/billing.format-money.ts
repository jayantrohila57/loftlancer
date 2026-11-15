const moneyFormatterCache = new Map<string, Intl.NumberFormat>()

export function formatMoneyMinorUnits(input: {
  amountMinor: number
  currency: string
  locale?: string
}) {
  const key = `${input.locale ?? "en-US"}:${input.currency}`
  let formatter = moneyFormatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(input.locale ?? "en-US", {
      style: "currency",
      currency: input.currency.toUpperCase(),
    })
    moneyFormatterCache.set(key, formatter)
  }
  return formatter.format(input.amountMinor / 100)
}
