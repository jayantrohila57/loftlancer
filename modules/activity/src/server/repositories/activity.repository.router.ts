import { deleteAccountHistory } from "./activity.repository.activity.delete"
import { listAccountActivity } from "./activity.repository.activity.list"
import { getActivityLocations } from "./activity.repository.activity.locations"

export const activityRepository = {
  deleteHistory: deleteAccountHistory,
  list: listAccountActivity,
  getLocations: getActivityLocations,
}

export * from "./activity.repository.activity.delete"
export * from "./activity.repository.activity.list"
export * from "./activity.repository.activity.locations"
export * from "./activity.repository.activity.record.security"
export * from "./activity.repository.activity.record.user"
export * from "./activity.repository.activity.session-type"
