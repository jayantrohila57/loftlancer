import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { sessionsRepository } from "../repositories/sessions.repository.router"

export async function listSessionsController(userId: string) {
  const sessions = await sessionsRepository.list(userId)
  if (!sessions)
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  return sessions
}

export async function listSessionsService(input: {
  system: { userId: string }
}) {
  try {
    return createSuccess(
      await listSessionsController(input.system.userId),
      "Sessions loaded."
    )
  } catch {
    logger.error("service.failed", {
      app: "auth",
      module: "sessions",
      outcome: "error",
      errorCode: "SESSIONS_UNAVAILABLE",
    })
    return createError("Could not load sessions. Please try again.", {
      code: "SESSIONS_UNAVAILABLE",
    })
  }
}
