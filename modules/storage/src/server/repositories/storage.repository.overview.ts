import {
  orgEntitlement,
  orgStorageFolder,
  orgStorageItem,
} from "@packages/drizzle/schema"
import { and, eq, isNull, sql } from "drizzle-orm"
import { requireStorageDb } from "./storage.repository.db"
import { loadOrgQuotaUsedBytes } from "./storage.repository.quota"

export async function loadStorageOverviewMetrics(organizationId: string) {
  const db = requireStorageDb()

  const [entitlement] = await db
    .select({
      quotaBytes: orgEntitlement.quotaBytes,
      planTier: orgEntitlement.planTier,
    })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, organizationId))
    .limit(1)

  const usedBytes = await loadOrgQuotaUsedBytes(organizationId)

  const [itemCount] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(orgStorageItem)
    .where(
      and(
        eq(orgStorageItem.organizationId, organizationId),
        eq(orgStorageItem.status, "active")
      )
    )

  const [folderCount] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(orgStorageFolder)
    .where(
      and(
        eq(orgStorageFolder.organizationId, organizationId),
        isNull(orgStorageFolder.trashedAt),
        eq(orgStorageFolder.isRoot, false)
      )
    )

  const [root] = await db
    .select({ id: orgStorageFolder.id })
    .from(orgStorageFolder)
    .where(
      and(
        eq(orgStorageFolder.organizationId, organizationId),
        eq(orgStorageFolder.isRoot, true)
      )
    )
    .limit(1)

  return {
    quotaBytes: entitlement?.quotaBytes ?? 2_147_483_648,
    planTier: entitlement?.planTier ?? ("free" as const),
    usedBytes,
    activeItemCount: itemCount?.count ?? 0,
    activeFolderCount: folderCount?.count ?? 0,
    rootFolderId: root?.id ?? null,
  }
}
