import type { Db } from "@packages/drizzle"
import { aiCreditLedger } from "@packages/drizzle/schema"
import { and, count, desc, eq, lt, or, sql } from "drizzle-orm"
import { z } from "zod"

const DEFAULT_HISTORY_LIMIT = 20

const historyCursorSchema = z
  .object({
    settledAt: z.string().datetime(),
    id: z.string().min(1).max(256),
  })
  .strict()

export function decodeAiUsageHistoryCursor(cursor: string | null | undefined) {
  if (!cursor) return null
  try {
    return historyCursorSchema.parse(
      JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"))
    )
  } catch {
    return "invalid" as const
  }
}

export async function readOrgAiUsageHistory(input: {
  db: Db
  organizationId: string
  cursor?: string | null
  limit?: number
}) {
  const pageSize = input.limit ?? DEFAULT_HISTORY_LIMIT
  const cursor = decodeAiUsageHistoryCursor(input.cursor)
  if (cursor === "invalid") {
    throw new Error("INVALID_CURSOR")
  }
  const [countRow] = await input.db
    .select({ value: count() })
    .from(aiCreditLedger)
    .where(
      and(
        eq(aiCreditLedger.organizationId, input.organizationId),
        eq(aiCreditLedger.state, "settled")
      )
    )

  const settledAtMs = sql<Date>`date_trunc('milliseconds', ${aiCreditLedger.settledAt})`
  const items = await input.db
    .select({
      id: aiCreditLedger.id,
      amount: aiCreditLedger.amount,
      settledAt: aiCreditLedger.settledAt,
    })
    .from(aiCreditLedger)
    .where(
      and(
        eq(aiCreditLedger.organizationId, input.organizationId),
        eq(aiCreditLedger.state, "settled"),
        cursor
          ? or(
              lt(settledAtMs, new Date(cursor.settledAt)),
              and(
                eq(settledAtMs, new Date(cursor.settledAt)),
                lt(aiCreditLedger.id, cursor.id)
              )
            )
          : undefined
      )
    )
    .orderBy(desc(aiCreditLedger.settledAt), desc(aiCreditLedger.id))
    .limit(pageSize + 1)

  const settled = items
    .filter((row) => row.settledAt !== null)
    .map((row) => ({
      id: row.id,
      amount: row.amount,
      settledAt: row.settledAt as Date,
    }))
  const page = settled.slice(0, pageSize)
  const next =
    settled.length > pageSize
      ? Buffer.from(
          JSON.stringify({
            settledAt: page.at(-1)?.settledAt.toISOString(),
            id: page.at(-1)?.id,
          }),
          "utf8"
        ).toString("base64url")
      : null

  return {
    totalSettledCount: Number(countRow?.value ?? 0),
    items: page,
    nextCursor: next,
  }
}
