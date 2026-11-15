import { repairOrganizationProvisioningRows } from "@modules/org/server"
import { orgStorageItem } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { createFailed, createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"

import { ORG_STORAGE_MAX_FILE_BYTES } from "../../utils/constants/storage.constants.limits"
import {
  extensionForOrgStorageMime,
  isOrgStorageAllowedMime,
} from "../../utils/constants/storage.constants.mime"
import { buildOrgStorageFilePathname } from "../../utils/storage.blob-path"
import { canEditInFolder } from "../repositories/storage.repository.access"
import { requireStorageDb } from "../repositories/storage.repository.db"
import {
  findOrgFolder,
  resolveOrgRootFolderId,
} from "../repositories/storage.repository.items"
import {
  loadOrgQuotaBytes,
  loadOrgQuotaUsedBytes,
  wouldExceedOrgQuota,
} from "../repositories/storage.repository.quota"
import { buildStorageAccessScope } from "../shared/storage.access-scope"
import {
  beginStorageActivity,
  recordStorageActivity,
} from "../shared/storage.activity"

export async function initStorageUploadService(input: {
  organizationId: string
  userId: string
  isOrgOwner: boolean
  folderId?: string
  displayName: string
  byteSize: number
  contentType: string
}) {
  if (input.byteSize > ORG_STORAGE_MAX_FILE_BYTES) {
    return createFailed("File must be 4 MB or smaller.", {
      code: "INVALID_FILE",
    })
  }
  if (!isOrgStorageAllowedMime(input.contentType)) {
    return createFailed("This file type is not allowed.", {
      code: "storage.invalid_content",
    })
  }

  const db = requireStorageDb()
  let rootFolderId = await resolveOrgRootFolderId({
    db,
    organizationId: input.organizationId,
  })
  if (!rootFolderId) {
    await repairOrganizationProvisioningRows({
      organizationId: input.organizationId,
    })
    rootFolderId = await resolveOrgRootFolderId({
      db,
      organizationId: input.organizationId,
    })
  }
  if (!rootFolderId) {
    return createFailed("Organization storage is not ready yet.", {
      code: "STORAGE_NOT_PROVISIONED",
    })
  }

  const targetFolderId = input.folderId ?? rootFolderId
  const folder = await findOrgFolder({
    db,
    organizationId: input.organizationId,
    folderId: targetFolderId,
  })
  if (!folder) {
    throw new ORPCError("NOT_FOUND", {
      message: "Folder not found.",
      data: { code: "storage.folder_not_found" },
    })
  }

  const scope = await buildStorageAccessScope({
    db,
    organizationId: input.organizationId,
    userId: input.userId,
    isOrgOwner: input.isOrgOwner,
  })
  if (
    !canEditInFolder({
      isOrgOwner: input.isOrgOwner,
      folderId: targetFolderId,
      folderGrantIds: scope.folderGrantIds,
    })
  ) {
    throw new ORPCError("FORBIDDEN", {
      message: "You do not have permission to upload here.",
      data: { code: "rbac.forbidden" },
    })
  }

  const [usedBytes, quotaBytes] = await Promise.all([
    loadOrgQuotaUsedBytes(input.organizationId),
    loadOrgQuotaBytes(input.organizationId),
  ])
  if (
    wouldExceedOrgQuota({
      usedBytes,
      quotaBytes,
      additionalBytes: input.byteSize,
    })
  ) {
    const activity = beginStorageActivity({
      actionId: "storage.quota_denied",
      actorUserId: input.userId,
    })
    await recordStorageActivity(activity, {
      outcome: "denied",
      metadata: {
        organizationId: input.organizationId,
        byteSize: input.byteSize,
      },
    })
    throw new ORPCError("FORBIDDEN", {
      message: "Organization storage is full.",
      data: { code: "quota.storage_exceeded" },
    })
  }

  const itemId = crypto.randomUUID()
  const extension = extensionForOrgStorageMime(input.contentType)
  const blobPathname = buildOrgStorageFilePathname({
    organizationId: input.organizationId,
    itemId,
    extension,
  })

  try {
    await db.insert(orgStorageItem).values({
      id: itemId,
      organizationId: input.organizationId,
      folderId: targetFolderId,
      uploadedByUserId: input.userId,
      displayName: input.displayName,
      contentType: input.contentType,
      byteSize: input.byteSize,
      blobPathname,
      status: "pending_upload",
    })
    return createSuccess({ itemId }, "Upload ready.")
  } catch (error) {
    logger.error("service.failed", {
      app: "auth",
      module: "storage",
      outcome: "error",
      errorCode: "STORAGE_UNAVAILABLE",
    })
    throw error
  }
}
