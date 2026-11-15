import { getDb } from "@packages/drizzle"
import { sql } from "drizzle-orm"

export async function checkDatabase() {
  const db = getDb()
  if (!db)
    return { ok: false as const, error: "DATABASE_URL is not configured" }
  try {
    await db.execute(sql`select 1`)
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}
