import { getDb } from "@packages/drizzle"
import { serverEnv } from "@packages/t3-env/server"

export function requireAuthDatabase() {
  const db = getDb()
  if (!db) {
    throw new Error(
      "DATABASE_URL is not configured — set it in apps/auth/.env and start Postgres"
    )
  }
  return db
}

export function requireAuthSecret() {
  const secret = serverEnv.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is not configured — run: openssl rand -base64 32"
    )
  }
  return secret
}
