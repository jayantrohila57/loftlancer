export const aiUsageOverviewKey = (organizationId: string | null | undefined) =>
  ["ai-usage", "overview", organizationId] as const

export const aiUsageHistoryKey = (
  organizationId: string | null | undefined,
  cursor?: string | null
) => ["ai-usage", "usage-history", organizationId, cursor ?? null] as const

export const aiUsageLimitsAlertsKey = (
  organizationId: string | null | undefined
) => ["ai-usage", "limits-alerts", organizationId] as const
