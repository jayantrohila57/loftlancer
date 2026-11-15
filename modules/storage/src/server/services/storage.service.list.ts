import { repairOrganizationProvisioningRows } from "@modules/org/server"
import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"

import { listAccessibleFolderContents } from "../repositories/storage.repository.list"

export async function listStorageContentsService(input: {
  organizationId: string
  userId: string
  isOrgOwner: boolean
  folderId?: string
}) {
  try {
    let result = await listAccessibleFolderContents(input)
    if (!result.folderId && !result.forbidden) {
      await repairOrganizationProvisioningRows({
        organizationId: input.organizationId,
      })
      result = await listAccessibleFolderContents(input)
    }
    if (result.forbidden) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have access to this folder.",
        data: { code: "rbac.forbidden" },
      })
    }
    if (!result.folderId) {
      return createError("Organization storage is not ready yet.", {
        code: "STORAGE_NOT_PROVISIONED",
      })
    }
    return createSuccess(
      {
        folderId: result.folderId,
        folders: result.folders,
        items: result.items,
      },
      "Storage list loaded."
    )
  } catch (error) {
    if (error instanceof ORPCError) throw error
    logger.error("service.failed", {
      app: "auth",
      module: "storage",
      outcome: "error",
      errorCode: "STORAGE_UNAVAILABLE",
    })
    return createError("Could not load files. Try again.", {
      code: "STORAGE_UNAVAILABLE",
    })
  }
}
