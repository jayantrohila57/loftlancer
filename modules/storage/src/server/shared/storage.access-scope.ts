import {
  loadOrgFolders,
  loadUserFolderGrants,
  loadUserItemGrants,
  resolveAccessibleFolderIds,
} from "../repositories/storage.repository.access"
import type { StorageOrgDb } from "../repositories/storage.repository.db"

export async function buildStorageAccessScope(input: {
  db: StorageOrgDb
  organizationId: string
  userId: string
  isOrgOwner: boolean
}) {
  const folders = await loadOrgFolders({
    db: input.db,
    organizationId: input.organizationId,
  })
  const grants = await loadUserFolderGrants({
    db: input.db,
    organizationId: input.organizationId,
    userId: input.userId,
  })
  const itemGrants = await loadUserItemGrants({
    db: input.db,
    organizationId: input.organizationId,
    userId: input.userId,
  })
  const folderGrantIds = resolveAccessibleFolderIds({
    isOrgOwner: input.isOrgOwner,
    folders,
    grants,
    itemGrantFolderIds: [],
  })
  const itemGrantIds = new Set(itemGrants.map((grant) => grant.itemId))
  return { folders, folderGrantIds, itemGrantIds }
}
