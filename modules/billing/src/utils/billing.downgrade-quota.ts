/** Warn before downgrade when stored bytes exceed the Free plan cap (existing data is kept; new uploads block). */
export function shouldWarnBillingDowngradeOverQuota(input: {
  currentPlanTier: "free" | "paid" | undefined
  usedBytes: number | undefined
  freeQuotaBytes: number | undefined
}) {
  if (input.currentPlanTier !== "paid") return false
  if (
    input.usedBytes === undefined ||
    input.freeQuotaBytes === undefined ||
    input.freeQuotaBytes <= 0
  ) {
    return false
  }
  return input.usedBytes > input.freeQuotaBytes
}
