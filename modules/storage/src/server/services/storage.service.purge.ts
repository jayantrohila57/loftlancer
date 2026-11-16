import { orgStorageItem } from "@packages/drizzle/schema"
import { and, eq, isNull, lt } from "drizzle-orm"

import { ORG_STORAGE_TRASH_RETENTION_MS } from "../../utils/constants/storage.constants.limits"
import { requireStorageDb } from "../repositories/storage.repository.db"
import { purgeOrgStorageItemRow } from "../shared/storage.purge-item"

export async function purgeExpiredOrgStorageTrash(input: { limit?: number }) {
  const db = requireStorageDb()
  const trashedBefore = new Date(Date.now() - ORG_STORAGE_TRASH_RETENTION_MS)
  const candidates = await db
    .select()
    .from(orgStorageItem)
    .where(
      and(
        eq(orgStorageItem.status, "trash"),
        isNull(orgStorageItem.purgedAt),
        lt(orgStorageItem.trashedAt, trashedBefore)
      )
    )
    .limit(input.limit ?? 100)

  let purged = 0
  for (const item of candidates) {
    const result = await purgeOrgStorageItemRow({
      db,
      organizationId: item.organizationId,
      itemId: item.id,
      blobPathname: item.blobPathname,
      uploadedByUserId: item.uploadedByUserId,
      actorUserId: item.uploadedByUserId,
      trigger: "cron",
      byteSize: item.byteSize,
    }).catch(() => null)
    if (result) purged += 1
  }
  return { purged, scanned: candidates.length }
}
