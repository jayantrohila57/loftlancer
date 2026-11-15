import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

const storageFolderRowSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  depth: z.number().int().nonnegative(),
  isRoot: z.boolean(),
})

const storageItemRowSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  contentType: z.string(),
  byteSize: z.number().int().nonnegative(),
  updatedAt: z.date(),
})

export const storageListDataSchema = z.object({
  folderId: z.string(),
  folders: z.array(storageFolderRowSchema),
  items: z.array(storageItemRowSchema),
})

export const storageListInputSchema = z.object({
  folderId: z.string().optional(),
})

export const storageListOutputSchema = serviceResponseSchema(
  storageListDataSchema
)
