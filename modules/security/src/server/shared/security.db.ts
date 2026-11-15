import { getDb } from "@packages/drizzle"

export function requireSecurityDb() {
  const db = getDb()
  if (!db) throw new Error("Database unavailable")
  return db
}

export function getSecurityDb() {
  return getDb()
}
