export function billingOverviewKey(organizationId: string | null | undefined) {
  return ["billing", "overview", organizationId ?? "none"] as const
}

export function billingPlansKey(organizationId: string | null | undefined) {
  return ["billing", "plans", organizationId ?? "none"] as const
}

export function billingInvoicesKey(
  organizationId: string | null | undefined,
  variant: "invoices" | "payment-history",
  cursor?: string | null
) {
  return [
    "billing",
    variant,
    organizationId ?? "none",
    cursor ?? "first",
  ] as const
}

export function billingProfileKey(organizationId: string | null | undefined) {
  return ["billing", "profile", organizationId ?? "none"] as const
}
