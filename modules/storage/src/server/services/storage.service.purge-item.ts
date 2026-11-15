import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"

import { requireStorageDb } from "../repositories/storage.repository.db"
import { findOrgStorageItemScoped } from "../repositories/storage.repository.items"
import { purgeOrgStorageItemRow } from "../shared/storage.purge-item"

export async function purgeStorageItemService(input: {
  organizationId: string
  actorUserId: string
  itemId: string
}) {
  const db = requireStorageDb()
  const item = await findOrgStorageItemScoped({
    db,
    organizationId: input.organizationId,
    itemId: input.itemId,
  })

  if (item?.status !== "trash") {
    throw new ORPCError("NOT_FOUND", {
      message: "Trashed file not found.",
      data: { code: "storage.item_not_found" },
    })
  }

  if (item.purgedAt) {
    throw new ORPCError("CONFLICT", {
      message: "This file was already permanently deleted.",
      data: { code: "storage.trash_purged" },
    })
  }

  const result = await purgeOrgStorageItemRow({
    db,
    organizationId: input.organizationId,
    itemId: item.id,
    blobPathname: item.blobPathname,
    uploadedByUserId: item.uploadedByUserId,
    actorUserId: input.actorUserId,
    trigger: "user",
  })

  if (!result) {
    throw new ORPCError("CONFLICT", {
      message: "This file was already permanently deleted.",
      data: { code: "storage.trash_purged" },
    })
  }

  return createSuccess(
    { itemId: item.id, purgedAt: result.purgedAt },
    "File permanently deleted."
  )
}
