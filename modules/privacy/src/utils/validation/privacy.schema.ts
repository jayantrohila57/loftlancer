import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const privacyConsentsSchema = z
  .object({
    marketingEmailEnabled: z.boolean(),
    analyticsEnabled: z.boolean(),
  })
  .strict()

export type PrivacyConsents = z.infer<typeof privacyConsentsSchema>

export const privacyConsentsUpdateSchema = z
  .object({
    marketingEmailEnabled: z.boolean().optional(),
    analyticsEnabled: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined))

export const privacyConsentsResponseSchema = serviceResponseSchema(
  privacyConsentsSchema
)

export const dataExportRequestInputSchema = z
  .object({
    message: z.string().max(2000).optional(),
  })
  .strict()

export const dataExportRequestResultSchema = z
  .object({
    requestId: z.string().min(1),
    submittedAt: z.string().min(1),
    downloadUrl: z.string().url().optional(),
    expiresAt: z.string().min(1).optional(),
  })
  .strict()

export const dataExportRequestResponseSchema = serviceResponseSchema(
  dataExportRequestResultSchema
)
