import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"
import { CONNECTED_ACCOUNT_PROVIDERS } from "../constants/connected-accounts.constants.providers"

export const connectedAccountProviderSchema = z.enum(
  CONNECTED_ACCOUNT_PROVIDERS
)
export const listProvidersDataSchema = z
  .object({
    google: z.boolean(),
    github: z.boolean(),
  })
  .strict()
export const listProvidersOutputSchema = serviceResponseSchema(
  listProvidersDataSchema
)
export const linkAccountInputSchema = z.object({
  provider: connectedAccountProviderSchema,
  callbackURL: z.string(),
  errorCallbackURL: z.string(),
})
