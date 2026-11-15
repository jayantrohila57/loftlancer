export type BillingPaymentSetupReturnKind = "cancelled" | "failed" | "success"

const BILLING_SETUP_PARAM = "billing_setup"
const BILLING_PORTAL_PARAM = "billing_portal"
const REDIRECT_STATUS_PARAM = "redirect_status"

const PORTAL_RETURN_VALUES = new Set([
  "return",
  "returned",
  "success",
  "succeeded",
  "complete",
  "completed",
])

const CANCELLED_VALUES = new Set(["cancelled", "canceled", "cancel"])
const FAILED_VALUES = new Set(["failed", "fail", "error"])
const SUCCESS_VALUES = new Set([
  "success",
  "succeeded",
  "complete",
  "completed",
])

function normalizeParam(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

function classifyBillingReturnValue(
  value: string
): BillingPaymentSetupReturnKind | null {
  if (!value) return null
  if (CANCELLED_VALUES.has(value)) return "cancelled"
  if (FAILED_VALUES.has(value)) return "failed"
  if (SUCCESS_VALUES.has(value)) return "success"
  return null
}

export function parseBillingPaymentSetupReturn(
  searchParams: Pick<URLSearchParams, "get">
): BillingPaymentSetupReturnKind | null {
  const billingSetup = classifyBillingReturnValue(
    normalizeParam(searchParams.get(BILLING_SETUP_PARAM))
  )
  if (billingSetup) return billingSetup

  return classifyBillingReturnValue(
    normalizeParam(searchParams.get(REDIRECT_STATUS_PARAM))
  )
}

export const billingPaymentSetupReturnMessageKey = {
  cancelled: "billingPaymentSetupCancelled",
  failed: "billingPaymentSetupFailed",
  success: "billingPaymentSetupSucceeded",
} as const satisfies Record<BillingPaymentSetupReturnKind, string>

export const billingPaymentSetupReturnToastType = {
  cancelled: "info",
  failed: "error",
  success: "success",
} as const satisfies Record<
  BillingPaymentSetupReturnKind,
  "info" | "error" | "success"
>

export function parseBillingPortalReturn(
  searchParams: Pick<URLSearchParams, "get">
): boolean {
  const value = normalizeParam(searchParams.get(BILLING_PORTAL_PARAM))
  return PORTAL_RETURN_VALUES.has(value)
}

export function stripBillingPaymentSetupReturnParams(url: URL) {
  url.searchParams.delete(BILLING_SETUP_PARAM)
  url.searchParams.delete(BILLING_PORTAL_PARAM)
  url.searchParams.delete(REDIRECT_STATUS_PARAM)
  url.searchParams.delete("setup_intent")
  url.searchParams.delete("setup_intent_client_secret")
}
