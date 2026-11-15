import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const notificationPreferencesSchema = z
  .object({
    securityEmailRequired: z.literal(true),
    billingEmailEnabled: z.boolean(),
    organizationInvitesEnabled: z.boolean(),
    productEmailEnabled: z.boolean(),
    isOrgOwner: z.boolean(),
  })
  .strict()

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>

export const notificationPreferencesUpdateSchema = z
  .object({
    billingEmailEnabled: z.boolean().optional(),
    organizationInvitesEnabled: z.boolean().optional(),
    productEmailEnabled: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined))

export const notificationPreferencesResponseSchema = serviceResponseSchema(
  notificationPreferencesSchema
)
