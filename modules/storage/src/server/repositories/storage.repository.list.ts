import { orgStorageFolder, orgStorageItem } from "@packages/drizzle/schema"
import { and, eq } from "drizzle-orm"
import { ORG_STORAGE_BROWSABLE_ITEM_STATUS } from "../../utils/storage.item-status"
import { denyCrossOrganizationResource } from "../shared/storage.org-scope"
import {
  canAccessFolder,
  filterVisibleListItems,
  includeFolderAncestors,
  loadOrgFolders,
  loadUserFolderGrants,
  loadUserItemGrants,
  resolveAccessibleFolderIds,
} from "./storage.repository.access"
import { requireStorageDb } from "./storage.repository.db"
import { findStorageFolderById } from "./storage.repository.items"

export async function listAccessibleFolderContents(input: {
  organizationId: string
  userId: string
  isOrgOwner: boolean
  folderId?: string
}) {
  const db = requireStorageDb()
  const metrics = await db
    .select({ id: orgStorageFolder.id })
    .from(orgStorageFolder)
    .where(
      and(
        eq(orgStorageFolder.organizationId, input.organizationId),
        eq(orgStorageFolder.isRoot, true)
      )
    )
    .limit(1)

  const rootFolderId = metrics[0]?.id
  if (!rootFolderId) {
    return { folderId: "", folders: [], items: [] as const }
  }

  const targetFolderId = input.folderId ?? rootFolderId

  const folders = await loadOrgFolders({
    db,
    organizationId: input.organizationId,
  })

  const grants = await loadUserFolderGrants({
    db,
    organizationId: input.organizationId,
    userId: input.userId,
  })
  const itemGrants = await loadUserItemGrants({
    db,
    organizationId: input.organizationId,
    userId: input.userId,
  })

  const accessibleFolderIds = includeFolderAncestors(
    folders,
    resolveAccessibleFolderIds({
      isOrgOwner: input.isOrgOwner,
      folders,
      grants,
      itemGrantFolderIds: itemGrants.flatMap((grant) =>
        grant.folderId ? [grant.folderId] : []
      ),
    })
  )
  const folderGrantIds = resolveAccessibleFolderIds({
    isOrgOwner: input.isOrgOwner,
    folders,
    grants,
    itemGrantFolderIds: [],
  })
  const grantedItemIds = new Set(itemGrants.map((grant) => grant.itemId))

  if (!canAccessFolder(accessibleFolderIds, targetFolderId)) {
    if (input.folderId) {
      const existsInOrg = folders.some((folder) => folder.id === targetFolderId)
      if (!existsInOrg) {
        const foreign = await findStorageFolderById({
          db,
          folderId: targetFolderId,
        })
        if (foreign) {
          denyCrossOrganizationResource({
            expectedOrganizationId: input.organizationId,
            actualOrganizationId: foreign.organizationId,
          })
        }
      }
    }
    return { forbidden: true as const, folderId: targetFolderId }
  }

  const childFolders = folders
    .filter(
      (folder) => folder.parentFolderId === targetFolderId && !folder.isRoot
    )
    .map((folder) => ({
      id: folder.id,
      displayName: folder.displayName,
      depth: folder.depth,
      isRoot: folder.isRoot,
    }))

  const visibleChildFolders = input.isOrgOwner
    ? childFolders
    : childFolders.filter((folder) => accessibleFolderIds.has(folder.id))

  const items = await db
    .select({
      id: orgStorageItem.id,
      displayName: orgStorageItem.displayName,
      contentType: orgStorageItem.contentType,
      byteSize: orgStorageItem.byteSize,
      updatedAt: orgStorageItem.updatedAt,
      folderId: orgStorageItem.folderId,
      status: orgStorageItem.status,
    })
    .from(orgStorageItem)
    .where(
      and(
        eq(orgStorageItem.organizationId, input.organizationId),
        eq(orgStorageItem.folderId, targetFolderId),
        eq(orgStorageItem.status, ORG_STORAGE_BROWSABLE_ITEM_STATUS)
      )
    )

  const visibleItems = filterVisibleListItems({
    isOrgOwner: input.isOrgOwner,
    targetFolderId,
    items,
    folderGrantIds,
    itemGrantIds: grantedItemIds,
  })

  return {
    forbidden: false as const,
    folderId: targetFolderId,
    folders: visibleChildFolders,
    items: visibleItems.map((item) => ({
      id: item.id,
      displayName: item.displayName,
      contentType: item.contentType,
      byteSize: item.byteSize,
      updatedAt: item.updatedAt,
    })),
  }
}
