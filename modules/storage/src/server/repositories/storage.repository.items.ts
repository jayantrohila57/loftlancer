import { orgStorageFolder, orgStorageItem } from "@packages/drizzle/schema"
import { and, eq, isNull } from "drizzle-orm"

import { denyCrossOrganizationResource } from "../shared/storage.org-scope"
import type { StorageOrgDb } from "./storage.repository.db"

export type OrgStorageItemRow = typeof orgStorageItem.$inferSelect

export async function findOrgStorageItem(input: {
  db: StorageOrgDb
  organizationId: string
  itemId: string
}) {
  const [row] = await input.db
    .select()
    .from(orgStorageItem)
    .where(
      and(
        eq(orgStorageItem.id, input.itemId),
        eq(orgStorageItem.organizationId, input.organizationId)
      )
    )
    .limit(1)
  return row ?? null
}

export async function findStorageItemById(input: {
  db: StorageOrgDb
  itemId: string
}) {
  const [row] = await input.db
    .select()
    .from(orgStorageItem)
    .where(eq(orgStorageItem.id, input.itemId))
    .limit(1)
  return row ?? null
}

export async function findOrgStorageItemScoped(input: {
  db: StorageOrgDb
  organizationId: string
  itemId: string
}) {
  const row = await findStorageItemById({
    db: input.db,
    itemId: input.itemId,
  })
  if (!row) return null
  denyCrossOrganizationResource({
    expectedOrganizationId: input.organizationId,
    actualOrganizationId: row.organizationId,
  })
  return row
}

export async function findStorageFolderById(input: {
  db: StorageOrgDb
  folderId: string
}) {
  const [row] = await input.db
    .select({
      id: orgStorageFolder.id,
      organizationId: orgStorageFolder.organizationId,
      trashedAt: orgStorageFolder.trashedAt,
    })
    .from(orgStorageFolder)
    .where(eq(orgStorageFolder.id, input.folderId))
    .limit(1)
  return row ?? null
}

export async function resolveOrgRootFolderId(input: {
  db: StorageOrgDb
  organizationId: string
}) {
  const [root] = await input.db
    .select({ id: orgStorageFolder.id })
    .from(orgStorageFolder)
    .where(
      and(
        eq(orgStorageFolder.organizationId, input.organizationId),
        eq(orgStorageFolder.isRoot, true),
        isNull(orgStorageFolder.trashedAt)
      )
    )
    .limit(1)
  return root?.id ?? null
}

export async function findOrgFolder(input: {
  db: StorageOrgDb
  organizationId: string
  folderId: string
}) {
  const row = await findStorageFolderById({
    db: input.db,
    folderId: input.folderId,
  })
  if (!row) return null
  denyCrossOrganizationResource({
    expectedOrganizationId: input.organizationId,
    actualOrganizationId: row.organizationId,
  })
  if (row.trashedAt) return null
  return { id: row.id, organizationId: row.organizationId }
}

export async function findActiveOrgStorageItemNameConflict(input: {
  db: StorageOrgDb
  organizationId: string
  folderId: string
  displayName: string
  excludeItemId: string
}) {
  const [row] = await input.db
    .select({ id: orgStorageItem.id })
    .from(orgStorageItem)
    .where(
      and(
        eq(orgStorageItem.organizationId, input.organizationId),
        eq(orgStorageItem.folderId, input.folderId),
        eq(orgStorageItem.displayName, input.displayName),
        eq(orgStorageItem.status, "active")
      )
    )
    .limit(1)
  if (!row || row.id === input.excludeItemId) {
    return null
  }
  return row
}

export async function listTrashedOrgItems(input: {
  db: StorageOrgDb
  organizationId: string
}) {
  return input.db
    .select({
      id: orgStorageItem.id,
      displayName: orgStorageItem.displayName,
      contentType: orgStorageItem.contentType,
      byteSize: orgStorageItem.byteSize,
      trashedAt: orgStorageItem.trashedAt,
      purgedAt: orgStorageItem.purgedAt,
      folderId: orgStorageItem.folderId,
      uploadedByUserId: orgStorageItem.uploadedByUserId,
    })
    .from(orgStorageItem)
    .where(
      and(
        eq(orgStorageItem.organizationId, input.organizationId),
        eq(orgStorageItem.status, "trash")
      )
    )
}

export async function listExpiredTrashedItems(input: {
  db: StorageOrgDb
  trashedBefore: Date
  limit?: number
}) {
  const query = input.db
    .select()
    .from(orgStorageItem)
    .where(
      and(eq(orgStorageItem.status, "trash"), isNull(orgStorageItem.purgedAt))
    )
    .limit(input.limit ?? 100)

  const rows = await query
  return rows.filter(
    (row) => row.trashedAt && row.trashedAt < input.trashedBefore
  )
}
