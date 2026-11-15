import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import type { DeleteActivityPayload } from "../../utils/types/activity.types.activity"
import { activityRepository } from "../repositories/activity.repository.router"

export async function deleteActivityController(
  userId: string,
  kind: "user" | "security"
) {
  await activityRepository.deleteHistory(userId, kind)
  return { deleted: true }
}

export async function deleteActivityService(input: {
  payload: DeleteActivityPayload
  system: { userId: string }
}) {
  try {
    return createSuccess(
      await deleteActivityController(input.system.userId, input.payload.kind),
      "Activity history deleted."
    )
  } catch {
    logger.error("service.failed", {
      app: "auth",
      module: "activity",
      outcome: "error",
      errorCode: "INTERNAL_ERROR",
    })
    return createError("Could not delete activity history.", {
      code: "INTERNAL_ERROR",
    })
  }
}
