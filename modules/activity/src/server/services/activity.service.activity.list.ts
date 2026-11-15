import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import { ACTIVITY_PAGE_SIZE } from "../../utils/constants/activity.constants.activity"
import type { ListActivityQuery } from "../../utils/types/activity.types.activity"
import { activityRepository } from "../repositories/activity.repository.router"

export async function listActivityController(
  userId: string,
  input: ListActivityQuery
) {
  const items = await activityRepository.list(
    userId,
    input.kind,
    ACTIVITY_PAGE_SIZE + 1,
    input.page * ACTIVITY_PAGE_SIZE,
    {
      type: input.type,
      since: input.since ? new Date(input.since) : undefined,
    }
  )
  const pageItems = items.slice(0, ACTIVITY_PAGE_SIZE)
  const locations =
    input.kind === "security"
      ? await activityRepository.getLocations(
          userId,
          pageItems.map((item) => item.id)
        )
      : []
  return {
    items: pageItems.map((item) => ({
      ...item,
      ipAddress: "ipAddress" in item ? item.ipAddress : null,
      userAgent: "userAgent" in item ? item.userAgent : null,
      resourceType: "resourceType" in item ? item.resourceType : null,
      source: "source" in item ? item.source : null,
      location: locations.find((entry) => entry.eventId === item.id) ?? null,
    })),
    hasMore: items.length > ACTIVITY_PAGE_SIZE,
  }
}

export async function listActivityService(input: {
  query: ListActivityQuery
  system: { userId: string }
}) {
  try {
    return createSuccess(
      await listActivityController(input.system.userId, input.query),
      "Activity loaded."
    )
  } catch {
    logger.error("service.failed", {
      app: "auth",
      module: "activity",
      outcome: "error",
      errorCode: "INTERNAL_ERROR",
    })
    return createError("Could not load activity. Please try again.", {
      code: "INTERNAL_ERROR",
    })
  }
}
