import {
  orgStorageFolder,
  orgStorageGrant,
  orgStorageItem,
} from "@packages/drizzle/schema"
import { and, eq, isNull } from "drizzle-orm"
import { isBrowsableStorageItemStatus } from "../../utils/storage.item-status"
import type { StorageOrgDb } from "./storage.repository.db"

export type StorageFolderRow = {
  readonly id: string
  readonly parentFolderId: string | null
  readonly displayName: string
  readonly depth: number
  readonly isRoot: boolean
}

export async function loadOrgFolders(input: {
  db: StorageOrgDb
  organizationId: string
}) {
  return input.db
    .select({
      id: orgStorageFolder.id,
      parentFolderId: orgStorageFolder.parentFolderId,
      displayName: orgStorageFolder.displayName,
      depth: orgStorageFolder.depth,
      isRoot: orgStorageFolder.isRoot,
    })
    .from(orgStorageFolder)
    .where(
      and(
        eq(orgStorageFolder.organizationId, input.organizationId),
        isNull(orgStorageFolder.trashedAt)
      )
    )
}

export async function loadUserFolderGrants(input: {
  db: StorageOrgDb
  organizationId: string
  userId: string
}) {
  return input.db
    .select({
      folderId: orgStorageGrant.folderId,
      includesDescendants: orgStorageGrant.includesDescendants,
    })
    .from(orgStorageGrant)
    .where(
      and(
        eq(orgStorageGrant.organizationId, input.organizationId),
        eq(orgStorageGrant.userId, input.userId)
      )
    )
}

export async function loadUserItemGrants(input: {
  db: StorageOrgDb
  organizationId: string
  userId: string
}) {
  const rows = await input.db
    .select({ folderId: orgStorageItem.folderId, itemId: orgStorageItem.id })
    .from(orgStorageGrant)
    .innerJoin(orgStorageItem, eq(orgStorageGrant.itemId, orgStorageItem.id))
    .where(
      and(
        eq(orgStorageGrant.organizationId, input.organizationId),
        eq(orgStorageItem.organizationId, input.organizationId),
        eq(orgStorageGrant.userId, input.userId),
        eq(orgStorageItem.status, "active")
      )
    )
  return rows
}

function collectDescendantFolderIds(
  folders: readonly StorageFolderRow[],
  rootIds: readonly string[]
) {
  const childrenByParent = new Map<string, string[]>()
  for (const folder of folders) {
    if (!folder.parentFolderId) continue
    const siblings = childrenByParent.get(folder.parentFolderId) ?? []
    siblings.push(folder.id)
    childrenByParent.set(folder.parentFolderId, siblings)
  }

  const accessible = new Set<string>()
  const queue = [...rootIds]
  while (queue.length > 0) {
    const id = queue.pop()
    if (!id || accessible.has(id)) continue
    accessible.add(id)
    const children = childrenByParent.get(id) ?? []
    for (const childId of children) queue.push(childId)
  }
  return accessible
}

export function resolveAccessibleFolderIds(input: {
  isOrgOwner: boolean
  folders: readonly StorageFolderRow[]
  grants: ReadonlyArray<{
    readonly folderId: string | null
    readonly includesDescendants: boolean
  }>
  itemGrantFolderIds: readonly string[]
}) {
  if (input.isOrgOwner) {
    return new Set(input.folders.map((folder) => folder.id))
  }

  const seed = new Set<string>()
  for (const grant of input.grants) {
    if (!grant.folderId) continue
    seed.add(grant.folderId)
    if (grant.includesDescendants) {
      const descendants = collectDescendantFolderIds(input.folders, [
        grant.folderId,
      ])
      for (const id of descendants) seed.add(id)
    }
  }
  for (const folderId of input.itemGrantFolderIds) seed.add(folderId)
  return seed
}

export function canAccessFolder(
  accessibleFolderIds: ReadonlySet<string>,
  folderId: string
) {
  return accessibleFolderIds.has(folderId)
}

/** Ancestors allow navigation to a grant without granting their contents. */
export function includeFolderAncestors(
  folders: readonly StorageFolderRow[],
  accessible: ReadonlySet<string>
) {
  const parents = new Map(
    folders.map((folder) => [folder.id, folder.parentFolderId])
  )
  const result = new Set(accessible)
  for (const id of accessible) {
    let parent = parents.get(id)
    while (parent && !result.has(parent)) {
      result.add(parent)
      parent = parents.get(parent)
    }
  }
  return result
}

export function canAccessItem(input: {
  isOrgOwner: boolean
  folderId: string
  itemId: string
  folderGrantIds: ReadonlySet<string>
  itemGrantIds: ReadonlySet<string>
}) {
  return (
    input.isOrgOwner ||
    input.folderGrantIds.has(input.folderId) ||
    input.itemGrantIds.has(input.itemId)
  )
}

/** v1 grants imply view and edit on folder or item scope. */
export function canEditInFolder(input: {
  isOrgOwner: boolean
  folderId: string
  folderGrantIds: ReadonlySet<string>
}) {
  return input.isOrgOwner || input.folderGrantIds.has(input.folderId)
}

export function assertOrganizationScope(input: {
  expectedOrganizationId: string
  actualOrganizationId: string
}) {
  if (input.expectedOrganizationId !== input.actualOrganizationId) {
    return false
  }
  return true
}

/** v1 grants include edit on scoped folders and items; owners manage all org storage. */
export function canManageStorageItem(input: {
  isOrgOwner: boolean
  folderId: string
  itemId: string
  folderGrantIds: ReadonlySet<string>
  itemGrantIds: ReadonlySet<string>
}) {
  return canAccessItem(input)
}

export function filterVisibleListItems<
  T extends { readonly id: string; readonly status?: string },
>(input: {
  isOrgOwner: boolean
  targetFolderId: string
  items: readonly T[]
  folderGrantIds: ReadonlySet<string>
  itemGrantIds: ReadonlySet<string>
}) {
  return input.items.filter((item) => {
    if (
      item.status !== undefined &&
      !isBrowsableStorageItemStatus(item.status)
    ) {
      return false
    }
    return canAccessItem({
      isOrgOwner: input.isOrgOwner,
      folderId: input.targetFolderId,
      itemId: item.id,
      folderGrantIds: input.folderGrantIds,
      itemGrantIds: input.itemGrantIds,
    })
  })
}

export function filterVisibleTrashedItems<
  T extends {
    readonly id: string
    readonly folderId: string | null
    readonly trashedAt: Date | null
  },
>(input: {
  isOrgOwner: boolean
  items: readonly T[]
  folderGrantIds: ReadonlySet<string>
  itemGrantIds: ReadonlySet<string>
}) {
  return input.items.filter(
    (row) =>
      row.trashedAt !== null &&
      canAccessItem({
        isOrgOwner: input.isOrgOwner,
        folderId: row.folderId ?? "",
        itemId: row.id,
        folderGrantIds: input.folderGrantIds,
        itemGrantIds: input.itemGrantIds,
      })
  )
}
