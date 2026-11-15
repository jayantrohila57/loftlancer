import { orgStorageItem } from "@packages/drizzle/schema"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { and, eq } from "drizzle-orm"
import {
  isListedTrashedItem,
  validateTrashedItemRestore,
} from "../../utils/storage.trash-restore.policy"
import {
  canManageStorageItem,
  filterVisibleTrashedItems,
} from "../repositories/storage.repository.access"
import { requireStorageDb } from "../repositories/storage.repository.db"
import {
  findActiveOrgStorageItemNameConflict,
  findOrgFolder,
  findOrgStorageItemScoped,
  listTrashedOrgItems,
  resolveOrgRootFolderId,
} from "../repositories/storage.repository.items"
import { buildStorageAccessScope } from "../shared/storage.access-scope"
import {
  beginStorageActivity,
  recordStorageActivity,
} from "../shared/storage.activity"
import { orgStorageBlobExists } from "../shared/storage.blob-head"

export async function listStorageTrashService(input: {
  organizationId: string
  userId: string
  isOrgOwner: boolean
}) {
  const db = requireStorageDb()
  const scope = await buildStorageAccessScope({
    db,
    organizationId: input.organizationId,
    userId: input.userId,
    isOrgOwner: input.isOrgOwner,
  })
  const rows = await listTrashedOrgItems({
    db,
    organizationId: input.organizationId,
  })
  const visible = filterVisibleTrashedItems({
    isOrgOwner: input.isOrgOwner,
    items: rows,
    folderGrantIds: scope.folderGrantIds,
    itemGrantIds: scope.itemGrantIds,
  })
  const now = new Date()
  const restorable = visible.filter((row) =>
    isListedTrashedItem({
      trashedAt: row.trashedAt,
      purgedAt: row.purgedAt,
      now,
    })
  )
  return createSuccess(
    {
      items: restorable.map((row) => ({
        id: row.id,
        displayName: row.displayName,
        contentType: row.contentType,
        byteSize: row.byteSize,
        trashedAt: row.trashedAt as Date,
      })),
    },
    "Trash loaded."
  )
}

export async function trashStorageItemService(input: {
  organizationId: string
  userId: string
  isOrgOwner: boolean
  itemId: string
}) {
  const db = requireStorageDb()
  const item = await findOrgStorageItemScoped({
    db,
    organizationId: input.organizationId,
    itemId: input.itemId,
  })
  if (item?.status !== "active") {
    throw new ORPCError("NOT_FOUND", {
      message: "File not found.",
      data: { code: "storage.item_not_found" },
    })
  }

  const scope = await buildStorageAccessScope({
    db,
    organizationId: input.organizationId,
    userId: input.userId,
    isOrgOwner: input.isOrgOwner,
  })
  const folderId = item.folderId ?? ""
  if (
    !canManageStorageItem({
      isOrgOwner: input.isOrgOwner,
      folderId,
      itemId: item.id,
      folderGrantIds: scope.folderGrantIds,
      itemGrantIds: scope.itemGrantIds,
    })
  ) {
    throw new ORPCError("FORBIDDEN", {
      message: "You do not have permission to delete this file.",
      data: { code: "rbac.forbidden" },
    })
  }

  const trashedAt = new Date()
  const activity = beginStorageActivity({
    actionId: "storage.delete",
    actorUserId: input.userId,
  })
  await db
    .update(orgStorageItem)
    .set({ status: "trash", trashedAt, updatedAt: trashedAt })
    .where(
      and(
        eq(orgStorageItem.id, item.id),
        eq(orgStorageItem.organizationId, input.organizationId)
      )
    )
  await recordStorageActivity(activity, {
    outcome: "success",
    resourceId: item.id,
    metadata: {
      organizationId: input.organizationId,
      itemId: item.id,
      displayName: item.displayName,
    },
  })
  return createSuccess({ itemId: item.id, trashedAt }, "File moved to trash.")
}

export async function restoreStorageItemService(input: {
  organizationId: string
  userId: string
  isOrgOwner: boolean
  itemId: string
}) {
  const db = requireStorageDb()
  const item = await findOrgStorageItemScoped({
    db,
    organizationId: input.organizationId,
    itemId: input.itemId,
  })
  if (!item) {
    throw new ORPCError("NOT_FOUND", {
      message: "Trashed file not found.",
      data: { code: "storage.item_not_found" },
    })
  }

  const scope = await buildStorageAccessScope({
    db,
    organizationId: input.organizationId,
    userId: input.userId,
    isOrgOwner: input.isOrgOwner,
  })
  const folderId = item.folderId ?? ""
  if (
    !canManageStorageItem({
      isOrgOwner: input.isOrgOwner,
      folderId,
      itemId: item.id,
      folderGrantIds: scope.folderGrantIds,
      itemGrantIds: scope.itemGrantIds,
    })
  ) {
    throw new ORPCError("FORBIDDEN", {
      message: "You do not have permission to restore this file.",
      data: { code: "rbac.forbidden" },
    })
  }

  const originalFolderExists = item.folderId
    ? Boolean(
        await findOrgFolder({
          db,
          organizationId: input.organizationId,
          folderId: item.folderId,
        })
      )
    : false
  const rootFolderId = await resolveOrgRootFolderId({
    db,
    organizationId: input.organizationId,
  })
  const blobExists = await orgStorageBlobExists(item.blobPathname)
  const restoreFolderId =
    item.folderId && originalFolderExists ? item.folderId : rootFolderId
  const nameConflict = restoreFolderId
    ? await findActiveOrgStorageItemNameConflict({
        db,
        organizationId: input.organizationId,
        folderId: restoreFolderId,
        displayName: item.displayName,
        excludeItemId: item.id,
      })
    : null
  const decision = validateTrashedItemRestore({
    status: item.status,
    purgedAt: item.purgedAt,
    trashedAt: item.trashedAt,
    blobExists,
    folderId: item.folderId,
    rootFolderId,
    originalFolderExists,
    conflictingActiveItemId: nameConflict?.id ?? null,
    now: new Date(),
  })
  if (!decision.ok) {
    throw new ORPCError(decision.status, {
      message: decision.message,
      data: { code: decision.code },
    })
  }

  const activity = beginStorageActivity({
    actionId: "storage.restore",
    actorUserId: input.userId,
  })
  await db
    .update(orgStorageItem)
    .set({
      status: "active",
      trashedAt: null,
      folderId: decision.targetFolderId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(orgStorageItem.id, item.id),
        eq(orgStorageItem.organizationId, input.organizationId)
      )
    )
  await recordStorageActivity(activity, {
    outcome: "success",
    resourceId: item.id,
    metadata: {
      organizationId: input.organizationId,
      itemId: item.id,
      displayName: item.displayName,
      restoredToRoot: decision.relocated,
    },
  })
  return createSuccess(
    { itemId: item.id, folderId: decision.targetFolderId },
    "File restored."
  )
}
