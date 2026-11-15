import { catchOrpcInputValidationFailure } from "@packages/orpc"
import { storageRoutes } from "../utils/config/storage.config.routes"
import {
  storageListInputSchema,
  storageListOutputSchema,
} from "../utils/validation/storage.list.schema"
import {
  storageCreateGrantInputSchema,
  storageCreateGrantOutputSchema,
  storageDownloadInputSchema,
  storageDownloadOutputSchema,
  storageInitUploadInputSchema,
  storageInitUploadOutputSchema,
  storageListActivityInputSchema,
  storageListActivityOutputSchema,
  storageListGrantsOutputSchema,
  storageListTrashOutputSchema,
  storagePurgeItemInputSchema,
  storagePurgeItemOutputSchema,
  storageRestoreItemInputSchema,
  storageRestoreItemOutputSchema,
  storageRevokeGrantInputSchema,
  storageRevokeGrantOutputSchema,
  storageTrashItemInputSchema,
  storageTrashItemOutputSchema,
} from "../utils/validation/storage.operations.schema"
import { storageOverviewOutputSchema } from "../utils/validation/storage.overview.schema"
import { storageService } from "./services/storage.service.router"
import { storageOrgProcedure } from "./shared/storage.procedure"
import { storageOrgOwnerProcedure } from "./shared/storage.procedure.owner"

export const storageController = {
  overview: storageOrgProcedure
    .route(storageRoutes.overview)
    .output(storageOverviewOutputSchema)
    .handler(async ({ context }) =>
      storageOverviewOutputSchema.parse(
        await storageService.overview({
          organizationId: context.organizationId,
          isOrgOwner: context.isOrgOwner,
        })
      )
    ),
  list: storageOrgProcedure
    .route(storageRoutes.list)
    .use(
      catchOrpcInputValidationFailure(
        storageListOutputSchema,
        "Invalid storage list request."
      )
    )
    .input(storageListInputSchema)
    .output(storageListOutputSchema)
    .handler(async ({ context, input }) =>
      storageListOutputSchema.parse(
        await storageService.list({
          organizationId: context.organizationId,
          userId: context.auth.user.id,
          isOrgOwner: context.isOrgOwner,
          folderId: input.folderId,
        })
      )
    ),
  initUpload: storageOrgProcedure
    .route(storageRoutes.initUpload)
    .use(
      catchOrpcInputValidationFailure(
        storageInitUploadOutputSchema,
        "Invalid upload request."
      )
    )
    .input(storageInitUploadInputSchema)
    .output(storageInitUploadOutputSchema)
    .handler(async ({ context, input }) =>
      storageInitUploadOutputSchema.parse(
        await storageService.initUpload({
          organizationId: context.organizationId,
          userId: context.auth.user.id,
          isOrgOwner: context.isOrgOwner,
          folderId: input.folderId,
          displayName: input.displayName,
          byteSize: input.byteSize,
          contentType: input.contentType,
        })
      )
    ),
  downloadUrl: storageOrgProcedure
    .route(storageRoutes.downloadUrl)
    .use(
      catchOrpcInputValidationFailure(
        storageDownloadOutputSchema,
        "Invalid download request."
      )
    )
    .input(storageDownloadInputSchema)
    .output(storageDownloadOutputSchema)
    .handler(async ({ context, input }) =>
      storageDownloadOutputSchema.parse(
        await storageService.downloadUrl({
          organizationId: context.organizationId,
          userId: context.auth.user.id,
          isOrgOwner: context.isOrgOwner,
          itemId: input.itemId,
        })
      )
    ),
  listGrants: storageOrgOwnerProcedure
    .route(storageRoutes.listGrants)
    .output(storageListGrantsOutputSchema)
    .handler(async ({ context }) =>
      storageListGrantsOutputSchema.parse(
        await storageService.listGrants({
          organizationId: context.organizationId,
        })
      )
    ),
  createGrant: storageOrgOwnerProcedure
    .route(storageRoutes.createGrant)
    .use(
      catchOrpcInputValidationFailure(
        storageCreateGrantOutputSchema,
        "Invalid storage grant request."
      )
    )
    .input(storageCreateGrantInputSchema)
    .output(storageCreateGrantOutputSchema)
    .handler(async ({ context, input }) =>
      storageCreateGrantOutputSchema.parse(
        await storageService.createGrant({
          organizationId: context.organizationId,
          actorUserId: context.auth.user.id,
          userId: input.userId,
          folderId: input.folderId,
          itemId: input.itemId,
          includesDescendants: input.includesDescendants,
        })
      )
    ),
  revokeGrant: storageOrgOwnerProcedure
    .route(storageRoutes.revokeGrant)
    .use(
      catchOrpcInputValidationFailure(
        storageRevokeGrantOutputSchema,
        "Invalid grant revoke request."
      )
    )
    .input(storageRevokeGrantInputSchema)
    .output(storageRevokeGrantOutputSchema)
    .handler(async ({ context, input }) =>
      storageRevokeGrantOutputSchema.parse(
        await storageService.revokeGrant({
          organizationId: context.organizationId,
          actorUserId: context.auth.user.id,
          grantId: input.grantId,
        })
      )
    ),
  listTrash: storageOrgProcedure
    .route(storageRoutes.listTrash)
    .output(storageListTrashOutputSchema)
    .handler(async ({ context }) =>
      storageListTrashOutputSchema.parse(
        await storageService.listTrash({
          organizationId: context.organizationId,
          userId: context.auth.user.id,
          isOrgOwner: context.isOrgOwner,
        })
      )
    ),
  trashItem: storageOrgProcedure
    .route(storageRoutes.trashItem)
    .use(
      catchOrpcInputValidationFailure(
        storageTrashItemOutputSchema,
        "Invalid trash request."
      )
    )
    .input(storageTrashItemInputSchema)
    .output(storageTrashItemOutputSchema)
    .handler(async ({ context, input }) =>
      storageTrashItemOutputSchema.parse(
        await storageService.trashItem({
          organizationId: context.organizationId,
          userId: context.auth.user.id,
          isOrgOwner: context.isOrgOwner,
          itemId: input.itemId,
        })
      )
    ),
  purgeItem: storageOrgOwnerProcedure
    .route(storageRoutes.purgeItem)
    .use(
      catchOrpcInputValidationFailure(
        storagePurgeItemOutputSchema,
        "Invalid purge request."
      )
    )
    .input(storagePurgeItemInputSchema)
    .output(storagePurgeItemOutputSchema)
    .handler(async ({ context, input }) =>
      storagePurgeItemOutputSchema.parse(
        await storageService.purgeItem({
          organizationId: context.organizationId,
          actorUserId: context.auth.user.id,
          itemId: input.itemId,
        })
      )
    ),
  restoreItem: storageOrgProcedure
    .route(storageRoutes.restoreItem)
    .use(
      catchOrpcInputValidationFailure(
        storageRestoreItemOutputSchema,
        "Invalid restore request."
      )
    )
    .input(storageRestoreItemInputSchema)
    .output(storageRestoreItemOutputSchema)
    .handler(async ({ context, input }) =>
      storageRestoreItemOutputSchema.parse(
        await storageService.restoreItem({
          organizationId: context.organizationId,
          userId: context.auth.user.id,
          isOrgOwner: context.isOrgOwner,
          itemId: input.itemId,
        })
      )
    ),
  listActivity: storageOrgProcedure
    .route(storageRoutes.listActivity)
    .use(
      catchOrpcInputValidationFailure(
        storageListActivityOutputSchema,
        "Invalid storage activity request."
      )
    )
    .input(storageListActivityInputSchema)
    .output(storageListActivityOutputSchema)
    .handler(async ({ context, input }) =>
      storageListActivityOutputSchema.parse(
        await storageService.listActivity({
          organizationId: context.organizationId,
          cursor: input.cursor,
          limit: input.limit,
        })
      )
    ),
}
