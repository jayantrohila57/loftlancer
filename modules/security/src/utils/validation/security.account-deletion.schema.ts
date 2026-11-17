import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const accountDeletionOwnedOrgSchema = z
  .object({
    organizationId: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    otherMemberCount: z.number().int().nonnegative(),
    settingsPath: z.string().min(1),
  })
  .strict()

export const accountDeletionStatusSchema = z
  .object({
    blockers: z.array(accountDeletionOwnedOrgSchema),
    canDelete: z.boolean(),
  })
  .strict()

export const accountDeletionStatusResponseSchema = serviceResponseSchema(
  accountDeletionStatusSchema
)
