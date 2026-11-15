import { beginActivity, recordActivity } from "@modules/activity/server"
import type { ActivityActionId } from "@modules/activity/utils/config/activity.actions"

type StorageActivityActionId = Extract<
  ActivityActionId,
  | "storage.upload"
  | "storage.quota_denied"
  | "storage.delete"
  | "storage.restore"
  | "storage.grant.create"
  | "storage.grant.revoke"
  | "storage.purge"
>

export function beginStorageActivity(input: {
  actionId: StorageActivityActionId
  actorUserId: string
}) {
  return beginActivity({
    actionId: input.actionId,
    ownerUserId: input.actorUserId,
    actor: { type: "user", userId: input.actorUserId },
  })
}

export async function recordStorageActivity(
  context: ReturnType<typeof beginStorageActivity>,
  input: {
    outcome: "success" | "denied" | "failed" | "error"
    metadata: Record<string, unknown>
    resourceId?: string
  },
  executor?: Parameters<typeof recordActivity>[2]
) {
  await recordActivity(
    context,
    {
      outcome: input.outcome,
      sourceApp: "auth",
      sourceModule: "storage",
      resourceType: "org_storage_item",
      resourceId: input.resourceId,
      metadata: input.metadata,
    },
    executor
  )
}
