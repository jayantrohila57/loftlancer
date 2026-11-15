import { repairOrganizationProvisioningRows } from "@modules/org/server"
import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"

import { loadStorageOverviewMetrics } from "../repositories/storage.repository.overview"

export async function getStorageOverviewService(input: {
  organizationId: string
  isOrgOwner: boolean
}) {
  try {
    let metrics = await loadStorageOverviewMetrics(input.organizationId)
    if (!metrics.rootFolderId) {
      await repairOrganizationProvisioningRows({
        organizationId: input.organizationId,
      })
      metrics = await loadStorageOverviewMetrics(input.organizationId)
    }
    return createSuccess(
      {
        organizationId: input.organizationId,
        usedBytes: metrics.usedBytes,
        quotaBytes: metrics.quotaBytes,
        planTier: metrics.planTier,
        activeItemCount: metrics.activeItemCount,
        activeFolderCount: metrics.activeFolderCount,
        rootFolderId: metrics.rootFolderId,
        isOwner: input.isOrgOwner,
      },
      "Storage overview loaded."
    )
  } catch (error) {
    if (error instanceof ORPCError) throw error
    logger.error("service.failed", {
      app: "auth",
      module: "storage",
      outcome: "error",
      errorCode: "STORAGE_UNAVAILABLE",
    })
    return createError("Could not load storage overview. Try again.", {
      code: "STORAGE_UNAVAILABLE",
    })
  }
}
