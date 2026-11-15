import { orgStorageItem } from "@packages/drizzle/schema"
import { createFailed, createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { and, eq } from "drizzle-orm"
import { isBrowsableStorageItemStatus } from "../../utils/storage.item-status"
import { canAccessItem } from "../repositories/storage.repository.access"
import { requireStorageDb } from "../repositories/storage.repository.db"
import { findOrgStorageItemScoped } from "../repositories/storage.repository.items"
import { buildStorageAccessScope } from "../shared/storage.access-scope"
import { createOrgStorageDownloadUrl } from "../shared/storage.blob-download"

export async function storageDownloadUrlService(input: {
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
  if (!item || !isBrowsableStorageItemStatus(item.status)) {
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
    !canAccessItem({
      isOrgOwner: input.isOrgOwner,
      folderId,
      itemId: item.id,
      folderGrantIds: scope.folderGrantIds,
      itemGrantIds: scope.itemGrantIds,
    })
  ) {
    throw new ORPCError("FORBIDDEN", {
      message: "You do not have access to this file.",
      data: { code: "rbac.forbidden" },
    })
  }

  try {
    const signed = await createOrgStorageDownloadUrl({
      organizationId: input.organizationId,
      pathname: item.blobPathname,
    })
    await db
      .update(orgStorageItem)
      .set({ updatedAt: new Date() })
      .where(
        and(
          eq(orgStorageItem.id, item.id),
          eq(orgStorageItem.organizationId, input.organizationId)
        )
      )
    return createSuccess(
      {
        url: signed.url,
        expiresAt: signed.expiresAt,
        displayName: item.displayName,
        contentType: item.contentType,
      },
      "Download link ready."
    )
  } catch {
    return createFailed("Could not prepare download.", {
      code: "STORAGE_UNAVAILABLE",
    })
  }
}
