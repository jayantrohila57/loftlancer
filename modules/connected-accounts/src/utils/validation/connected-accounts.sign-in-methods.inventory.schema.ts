import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"
import { ACTIVE_SIGN_IN_OAUTH_PROVIDERS } from "../constants/connected-accounts.constants.providers"

const activeOauthProviderSchema = z.enum(ACTIVE_SIGN_IN_OAUTH_PROVIDERS)

export const signInMethodInventoryOauthEntrySchema = z
  .object({
    configured: z.boolean(),
    id: activeOauthProviderSchema,
  })
  .strict()

export const signInMethodInventoryDataSchema = z
  .object({
    email: z
      .object({
        available: z.literal(true),
      })
      .strict(),
    oauth: z.array(signInMethodInventoryOauthEntrySchema),
  })
  .strict()

export const signInMethodInventoryOutputSchema = serviceResponseSchema(
  signInMethodInventoryDataSchema
)
