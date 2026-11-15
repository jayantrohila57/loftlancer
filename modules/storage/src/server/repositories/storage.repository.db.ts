import type { Db } from "@packages/drizzle"
import { getDb } from "@packages/drizzle"

export type StorageOrgDb = Db

export function requireStorageDb(): StorageOrgDb {
  const db = getDb()
  if (!db) throw new Error("Database is not configured")
  return db
}
