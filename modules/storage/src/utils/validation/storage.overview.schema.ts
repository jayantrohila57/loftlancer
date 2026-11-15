import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const storageOverviewDataSchema = z.object({
  organizationId: z.string(),
  usedBytes: z.number().int().nonnegative(),
  quotaBytes: z.number().int().positive(),
  planTier: z.enum(["free", "paid"]),
  activeItemCount: z.number().int().nonnegative(),
  activeFolderCount: z.number().int().nonnegative(),
  rootFolderId: z.string().nullable(),
  isOwner: z.boolean(),
})

export const storageOverviewOutputSchema = serviceResponseSchema(
  storageOverviewDataSchema
)
