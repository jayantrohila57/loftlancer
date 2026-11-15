import { beginActivity } from "@modules/activity/server"
import { logger } from "@packages/logger/server"

import { tombstoneUserForDeletion } from "./security.user-tombstone"

type DeleteUserUser = { readonly id: string }

export function buildSecurityDeleteUserCallbacks() {
  const pending = new WeakMap<Request, string>()
  return {
    async beforeDelete(user: DeleteUserUser, request?: Request) {
      await tombstoneUserForDeletion(user.id)
      const activity = beginActivity({
        actionId: "security.account.delete",
        ownerUserId: user.id,
        actor: { type: "user", userId: user.id },
      })
      if (request) pending.set(request, activity.activityId)
    },
    async afterDelete(_user: DeleteUserUser, request?: Request) {
      const activityId = request ? pending.get(request) : undefined
      if (request) pending.delete(request)
      logger.info("account.delete.completed", {
        app: "auth",
        module: "security",
        actionId: "security.account.delete",
        activityId,
        outcome: "success",
      })
    },
  }
}
