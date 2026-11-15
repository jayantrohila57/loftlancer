import { orgEntitlement, orgStorageItem } from "@packages/drizzle/schema"
import { and, eq, inArray, isNull, sql } from "drizzle-orm"

import { requireStorageDb } from "./storage.repository.db"

const QUOTA_COUNT_STATUSES = ["active", "pending_upload", "trash"] as const

export async function loadOrgQuotaBytes(organizationId: string) {
  const db = requireStorageDb()
  const [entitlement] = await db
    .select({ quotaBytes: orgEntitlement.quotaBytes })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, organizationId))
    .limit(1)
  return entitlement?.quotaBytes ?? 2_147_483_648
}

export async function loadOrgQuotaUsedBytes(organizationId: string) {
  const db = requireStorageDb()
  const [usage] = await db
    .select({
      usedBytes: sql<number>`coalesce(sum(${orgStorageItem.byteSize}), 0)::bigint`,
    })
    .from(orgStorageItem)
    .where(
      and(
        eq(orgStorageItem.organizationId, organizationId),
        inArray(orgStorageItem.status, [...QUOTA_COUNT_STATUSES]),
        isNull(orgStorageItem.purgedAt)
      )
    )
  return Number(usage?.usedBytes ?? 0)
}

export function wouldExceedOrgQuota(input: {
  usedBytes: number
  quotaBytes: number
  additionalBytes: number
}) {
  return input.usedBytes + input.additionalBytes > input.quotaBytes
}
