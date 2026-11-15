import { logger } from "@packages/logger/server"
import { createError, createFailed, createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import type { z } from "zod"
import type { updateLocationPreferenceSchema } from "../../utils/validation/location.location.preference.schema"
import type { saveLocationInputSchema } from "../../utils/validation/location.location.save.schema"
import { deleteLocationHistoryController } from "./location.service.location.delete"
import { getLocationController } from "./location.service.location.get"
import { updateLocationPreferenceController } from "./location.service.location.preference"
import { saveLocationController } from "./location.service.location.save"

type System = { userId: string; sessionId: string }
type Coordinates = z.infer<typeof saveLocationInputSchema>
export const locationService = {
  async get({ system }: { system: System }) {
    try {
      return createSuccess(
        await getLocationController(system.userId, system.sessionId),
        "Location settings loaded."
      )
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "location",
        outcome: "error",
        errorCode: "LOCATION_UNAVAILABLE",
      })
      return createError("Could not load location settings.", {
        code: "LOCATION_UNAVAILABLE",
      })
    }
  },
  async delete({ system }: { system: System }) {
    try {
      return createSuccess(
        await deleteLocationHistoryController(system.userId),
        "Location history deleted."
      )
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "location",
        outcome: "error",
        errorCode: "LOCATION_UNAVAILABLE",
      })
      return createError("Could not delete location history.", {
        code: "LOCATION_UNAVAILABLE",
      })
    }
  },
  async preference({
    system,
    payload,
  }: {
    system: System
    payload: z.infer<typeof updateLocationPreferenceSchema>
  }) {
    try {
      return createSuccess(
        await updateLocationPreferenceController(
          system.userId,
          payload.enabled
        ),
        "Location preference updated."
      )
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "location",
        outcome: "error",
        errorCode: "LOCATION_UNAVAILABLE",
      })
      return createError("Could not update location settings.", {
        code: "LOCATION_UNAVAILABLE",
      })
    }
  },
  async save({ system, payload }: { system: System; payload: Coordinates }) {
    try {
      return createSuccess(
        await saveLocationController(system.userId, system.sessionId, payload),
        "Location saved."
      )
    } catch (error) {
      if (error instanceof ORPCError && error.code === "CONFLICT")
        return createFailed(
          "Location history changed. Capture a new location.",
          {
            code: "LOCATION_STALE",
          }
        )
      if (error instanceof ORPCError && error.code === "FORBIDDEN")
        return createFailed("Location collection is disabled.", {
          code: "LOCATION_DISABLED",
        })
      logger.error("service.failed", {
        app: "auth",
        module: "location",
        outcome: "error",
        errorCode: "LOCATION_UNAVAILABLE",
      })
      return createError("Could not save location.", {
        code: "LOCATION_UNAVAILABLE",
      })
    }
  },
}
