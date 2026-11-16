import { downgradeExpiredGraceSubscriptions } from "@packages/billing"
import { getDb } from "@packages/drizzle"

function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === "development"
  const header = request.headers.get("authorization")
  return header === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }
  const db = getDb()
  if (!db) {
    return Response.json({ error: "database_unavailable" }, { status: 503 })
  }
  const result = await downgradeExpiredGraceSubscriptions({ db, limit: 100 })
  return Response.json(result)
}
