import { trackBillingUsage } from "@packages/billing"
import { del, put } from "@packages/blob"
import { orgStorageItem } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { createFailed, createSuccess } from "@packages/orpc"
import { and, eq } from "drizzle-orm"

import { ORG_STORAGE_MAX_FILE_BYTES } from "../../utils/constants/storage.constants.limits"
import { isOrgStorageAllowedMime } from "../../utils/constants/storage.constants.mime"
import { assertOrgScopedBlobPathname } from "../../utils/storage.blob-path"
import { validateOrgStorageBytes } from "../../utils/storage.content-sniff"
import { requireStorageDb } from "../repositories/storage.repository.db"
import { findOrgStorageItemScoped } from "../repositories/storage.repository.items"
import {
  beginStorageActivity,
  recordStorageActivity,
} from "../shared/storage.activity"

async function abortIncompleteOrgStorageBlob(pathname: string) {
  try {
    await del(pathname)
  } catch {
    logger.error("service.failed", {
      app: "auth",
      module: "storage",
      outcome: "error",
      errorCode: "UPLOAD_ABORT_FAILED",
    })
  }
}

export async function completeStorageUploadService(input: {
  organizationId: string
  userId: string
  itemId: string
  file: File
}) {
  if (input.file.size === 0 || input.file.size > ORG_STORAGE_MAX_FILE_BYTES) {
    return createFailed("File must be 4 MB or smaller.", {
      code: "INVALID_FILE",
    })
  }

  const db = requireStorageDb()
  const row = await findOrgStorageItemScoped({
    db,
    organizationId: input.organizationId,
    itemId: input.itemId,
  })
  if (!row) {
    return createFailed("Upload not found.", { code: "storage.item_not_found" })
  }
  if (row.status !== "pending_upload") {
    return createFailed("Upload already completed.", {
      code: "storage.upload_completed",
    })
  }
  if (row.uploadedByUserId !== input.userId) {
    return createFailed("This upload belongs to another user.", {
      code: "rbac.forbidden",
    })
  }
  if (row.byteSize !== input.file.size) {
    return createFailed("File size does not match the reserved upload.", {
      code: "storage.size_mismatch",
    })
  }

  const bytes = new Uint8Array(await input.file.arrayBuffer())
  const contentType = validateOrgStorageBytes({
    bytes,
    declaredType: row.contentType,
  })
  if (
    !contentType ||
    (input.file.type &&
      (!isOrgStorageAllowedMime(input.file.type) ||
        input.file.type !== contentType))
  ) {
    return createFailed("This file type is not allowed.", {
      code: "storage.invalid_content",
    })
  }

  assertOrgScopedBlobPathname({
    organizationId: input.organizationId,
    pathname: row.blobPathname,
  })

  const activity = beginStorageActivity({
    actionId: "storage.upload",
    actorUserId: input.userId,
  })

  let blobWritten = false
  try {
    await put(row.blobPathname, input.file, {
      access: "private",
      contentType,
      addRandomSuffix: false,
    })
    blobWritten = true

    const activated = await db
      .update(orgStorageItem)
      .set({ status: "active", contentType, updatedAt: new Date() })
      .where(
        and(
          eq(orgStorageItem.id, input.itemId),
          eq(orgStorageItem.organizationId, input.organizationId),
          eq(orgStorageItem.status, "pending_upload")
        )
      )
      .returning({ id: orgStorageItem.id })

    if (activated.length === 0) {
      const fresh = await findOrgStorageItemScoped({
        db,
        organizationId: input.organizationId,
        itemId: input.itemId,
      })
      if (fresh?.status === "active") {
        return createFailed("Upload already completed.", {
          code: "storage.upload_completed",
        })
      }
      if (fresh?.status === "pending_upload") {
        await abortIncompleteOrgStorageBlob(row.blobPathname)
        await recordStorageActivity(activity, {
          outcome: "error",
          resourceId: input.itemId,
          metadata: {
            organizationId: input.organizationId,
            itemId: input.itemId,
            displayName: row.displayName,
            byteSize: row.byteSize,
          },
        })
        logger.error("service.failed", {
          app: "auth",
          module: "storage",
          outcome: "error",
          errorCode: "UPLOAD_FAILED",
        })
        return createFailed("Upload failed. Try again.", {
          code: "UPLOAD_FAILED",
        })
      }
      return createFailed("Upload not found.", {
        code: "storage.item_not_found",
      })
    }

    await recordStorageActivity(activity, {
      outcome: "success",
      resourceId: input.itemId,
      metadata: {
        organizationId: input.organizationId,
        itemId: input.itemId,
        displayName: row.displayName,
        byteSize: row.byteSize,
      },
    })
    await trackBillingUsage({
      organizationId: input.organizationId,
      featureId: "org_storage_bytes",
      value: row.byteSize,
      idempotencyKey: `storage-upload:${input.itemId}`,
    })
    return createSuccess(
      { itemId: input.itemId, displayName: row.displayName },
      "File uploaded."
    )
  } catch (_error) {
    if (blobWritten) {
      const fresh = await findOrgStorageItemScoped({
        db,
        organizationId: input.organizationId,
        itemId: input.itemId,
      })
      if (fresh?.status === "pending_upload") {
        await abortIncompleteOrgStorageBlob(row.blobPathname)
      }
    }
    await recordStorageActivity(activity, {
      outcome: "error",
      resourceId: input.itemId,
      metadata: {
        organizationId: input.organizationId,
        itemId: input.itemId,
        displayName: row.displayName,
        byteSize: row.byteSize,
      },
    })
    logger.error("service.failed", {
      app: "auth",
      module: "storage",
      outcome: "error",
      errorCode: "UPLOAD_FAILED",
    })
    return createFailed("Upload failed. Try again.", { code: "UPLOAD_FAILED" })
  }
}
