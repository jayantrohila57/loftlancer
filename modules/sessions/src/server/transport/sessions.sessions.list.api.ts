import { getCompatibilitySession, unauthorized } from "@modules/security/server"
import { logger } from "@packages/logger/server"
import { ORPCError } from "@packages/orpc/server"
import { listSessionsController } from "../services/sessions.service.sessions.list"
export async function getAccountSessionsResponse(request: Request) {
  const auth = await getCompatibilitySession(request)
  if (!auth) return unauthorized()
  try {
    return Response.json(await listSessionsController(auth.user.id), {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    if (error instanceof ORPCError && error.code === "SERVICE_UNAVAILABLE")
      return Response.json({ error: "Database unavailable." }, { status: 503 })
    logger.error("sessions.list.compat_failed", {
      app: "auth",
      module: "sessions",
      outcome: "error",
    })
    return Response.json({ error: "Database unavailable." }, { status: 503 })
  }
}
