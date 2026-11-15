import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

import { ORG_STORAGE_MAX_FILE_BYTES } from "../constants/storage.constants.limits"

const itemIdSchema = z.object({ itemId: z.string().min(1) })

export const storageInitUploadInputSchema = z.object({
  folderId: z.string().min(1).optional(),
  displayName: z.string().min(1).max(256),
  byteSize: z.number().int().positive().max(ORG_STORAGE_MAX_FILE_BYTES),
  contentType: z.string().min(3).max(128),
})

export const storageInitUploadDataSchema = z.object({
  itemId: z.string().min(1),
})

export const storageInitUploadOutputSchema = serviceResponseSchema(
  storageInitUploadDataSchema
)

export const storageDownloadInputSchema = itemIdSchema

export const storageDownloadDataSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string().datetime(),
  displayName: z.string(),
  contentType: z.string(),
})

export const storageDownloadOutputSchema = serviceResponseSchema(
  storageDownloadDataSchema
)

export const storageGrantRowSchema = z.object({
  id: z.string(),
  userId: z.string(),
  folderId: z.string().nullable(),
  itemId: z.string().nullable(),
  includesDescendants: z.boolean(),
  createdAt: z.date(),
})

export const storageListGrantsDataSchema = z.object({
  grants: z.array(storageGrantRowSchema),
})

export const storageListGrantsOutputSchema = serviceResponseSchema(
  storageListGrantsDataSchema
)

export const storageCreateGrantInputSchema = z
  .object({
    userId: z.string().min(1),
    folderId: z.string().min(1).optional(),
    itemId: z.string().min(1).optional(),
    includesDescendants: z.boolean().optional(),
  })
  .refine((value) => (value.folderId ? 1 : 0) + (value.itemId ? 1 : 0) === 1, {
    message: "Specify either folderId or itemId.",
  })

export const storageCreateGrantDataSchema = z.object({
  grantId: z.string().min(1),
})

export const storageCreateGrantOutputSchema = serviceResponseSchema(
  storageCreateGrantDataSchema
)

export const storageRevokeGrantInputSchema = z.object({
  grantId: z.string().min(1),
})

export const storageRevokeGrantDataSchema = z.object({
  revoked: z.literal(true),
})

export const storageRevokeGrantOutputSchema = serviceResponseSchema(
  storageRevokeGrantDataSchema
)

export const storageTrashItemInputSchema = itemIdSchema

export const storageTrashItemDataSchema = z.object({
  itemId: z.string(),
  trashedAt: z.date(),
})

export const storageTrashItemOutputSchema = serviceResponseSchema(
  storageTrashItemDataSchema
)

export const storageRestoreItemInputSchema = itemIdSchema

export const storageRestoreItemDataSchema = z.object({
  itemId: z.string(),
  folderId: z.string().nullable(),
})

export const storageRestoreItemOutputSchema = serviceResponseSchema(
  storageRestoreItemDataSchema
)

const trashRowSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  contentType: z.string(),
  byteSize: z.number().int().nonnegative(),
  trashedAt: z.date(),
})

export const storageListTrashDataSchema = z.object({
  items: z.array(trashRowSchema),
})

export const storageListTrashOutputSchema = serviceResponseSchema(
  storageListTrashDataSchema
)

const storageActivityRowSchema = z.object({
  activityId: z.string(),
  actionId: z.string(),
  outcome: z.string(),
  occurredAt: z.date(),
  actorUserId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
})

export const storageListActivityInputSchema = z.object({
  cursor: z.string().min(1).max(2000).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export const storageListActivityDataSchema = z.object({
  events: z.array(storageActivityRowSchema),
  nextCursor: z.string().nullable(),
})

export const storageListActivityOutputSchema = serviceResponseSchema(
  storageListActivityDataSchema
)

export const storagePurgeItemInputSchema = itemIdSchema

export const storagePurgeItemDataSchema = z.object({
  itemId: z.string(),
  purgedAt: z.date(),
})

export const storagePurgeItemOutputSchema = serviceResponseSchema(
  storagePurgeItemDataSchema
)
