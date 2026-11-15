import { ORPCError } from "@packages/orpc/server"
import type { LocationInput } from "../../utils/types/location.types"
import { StaleLocationGenerationError } from "../repositories/location.repository.location.save"
import { saveSessionLocation } from "../repositories/location.repository.router"

export async function saveLocationController(
  userId: string,
  sessionId: string,
  value: LocationInput
) {
  let saved: Awaited<ReturnType<typeof saveSessionLocation>>
  try {
    saved = await saveSessionLocation(userId, sessionId, value)
  } catch (error) {
    if (error instanceof StaleLocationGenerationError)
      throw new ORPCError("CONFLICT", {
        message: "Location history changed. Capture a new location.",
      })
    throw error
  }
  if (!saved)
    throw new ORPCError("FORBIDDEN", {
      message: "Location collection is disabled.",
    })
  return { capturedAt: saved.capturedAt }
}
