import { trackBillingUsage } from "@packages/billing"
import { del } from "@packages/blob"
import { orgStorageItem } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { and, eq, isNull } from "drizzle-orm"

import {
  assertPurgeAllowedBlobPathname,
  OrgStorageCrossOrgPathError,
  OrgStorageProtectedPrefixError,
} from "../../utils/storage.blob-path"
import type { StorageOrgDb } from "../repositories/storage.repository.db"
import { beginStorageActivity, recordStorageActivity } from "./storage.activity"

export async function purgeOrgStorageItemRow(input: {
  db: StorageOrgDb
  organizationId: string
  itemId: string
  blobPathname: string
  uploadedByUserId: string
  actorUserId: string
  trigger: "user" | "cron"
  byteSize?: number
}): Promise<{ purgedAt: Date } | null> {
  const activity = beginStorageActivity({
    actionId: "storage.purge",
    actorUserId: input.actorUserId,
  })

  try {
    assertPurgeAllowedBlobPathname(input.blobPathname)
    await del(input.blobPathname)
  } catch (error) {
    if (
      error instanceof OrgStorageCrossOrgPathError ||
      error instanceof OrgStorageProtectedPrefixError
    ) {
      logger.error("storage.purge.blocked_path", {
        query: { itemId: input.itemId, pathname: input.blobPathname },
      })
      await recordStorageActivity(activity, {
        outcome: "failed",
        resourceId: input.itemId,
        metadata: {
          organizationId: input.organizationId,
          itemId: input.itemId,
          trigger: input.trigger,
        },
      })
      return null
    }
    logger.error("storage.purge.failed", {
      query: {
        itemId: input.itemId,
        error: error instanceof Error ? error.message : "unknown",
      },
    })
    await recordStorageActivity(activity, {
      outcome: "failed",
      resourceId: input.itemId,
      metadata: {
        organizationId: input.organizationId,
        itemId: input.itemId,
        trigger: input.trigger,
      },
    })
    throw error
  }

  const purgedAt = new Date()
  const updated = await input.db
    .update(orgStorageItem)
    .set({ purgedAt, updatedAt: purgedAt })
    .where(
      and(
        eq(orgStorageItem.id, input.itemId),
        eq(orgStorageItem.organizationId, input.organizationId),
        eq(orgStorageItem.status, "trash"),
        isNull(orgStorageItem.purgedAt)
      )
    )
    .returning({ id: orgStorageItem.id })

  if (updated.length === 0) {
    return null
  }

  await recordStorageActivity(activity, {
    outcome: "success",
    resourceId: input.itemId,
    metadata: {
      organizationId: input.organizationId,
      itemId: input.itemId,
      trigger: input.trigger,
    },
  })

  if (input.byteSize && input.byteSize > 0) {
    await trackBillingUsage({
      organizationId: input.organizationId,
      featureId: "org_storage_bytes",
      value: -input.byteSize,
      idempotencyKey: `storage-purge:${input.itemId}`,
    })
  }

  return { purgedAt }
}
