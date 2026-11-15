import { createError, createSuccess } from "@packages/orpc"
import { healthRepository } from "../repositories/health.repository.router"

export async function checkDatabaseHealth() {
  const result = await healthRepository.checkDatabase()
  if (!result.ok)
    return createError("Database unavailable.", {
      code: "DATABASE_UNAVAILABLE",
      details: result.error,
    })
  return createSuccess({ ok: true }, "Database available.")
}
