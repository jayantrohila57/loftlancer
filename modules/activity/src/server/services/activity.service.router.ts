import { deleteActivityService } from "./activity.service.activity.delete"
import { listActivityService } from "./activity.service.activity.list"

export const activityService = {
  delete: deleteActivityService,
  list: listActivityService,
}
