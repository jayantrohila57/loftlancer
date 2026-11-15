import { getDb } from "@packages/drizzle"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"

import { readOrgAiUsageHistory } from "../repositories/ai-usage.repository.history"
import { readOrgAiUsageOverviewRow } from "../repositories/ai-usage.repository.overview"

export async function aiUsageHistoryService(input: {
  organizationId: string
  cursor?: string | null
  limit?: number
}) {
  const db = getDb()
  if (!db) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  }

  const row = await readOrgAiUsageOverviewRow({
    db,
    organizationId: input.organizationId,
  })
  if (!row) {
    throw new ORPCError("FORBIDDEN", {
      message: "Organization entitlements are not ready.",
      data: { code: "billing.entitlement_missing" },
    })
  }

  try {
    const history = await readOrgAiUsageHistory({
      db,
      organizationId: input.organizationId,
      cursor: input.cursor,
      limit: input.limit,
    })

    return createSuccess(
      {
        organizationId: input.organizationId,
        meteredRoutesAvailable: false as const,
        totalSettledCount: history.totalSettledCount,
        nextCursor: history.nextCursor,
        items: history.items.map((entry) => ({
          id: entry.id,
          amount: entry.amount,
          settledAt: entry.settledAt.toISOString(),
        })),
      },
      "AI usage history loaded."
    )
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CURSOR") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Invalid usage history cursor.",
        data: { code: "INVALID_CURSOR" },
      })
    }
    throw error
  }
}
