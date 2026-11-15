import type { z } from "zod"
import type {
  connectedAccountProviderSchema,
  linkAccountInputSchema,
  listProvidersDataSchema,
  listProvidersOutputSchema,
} from "../validation/connected-accounts.providers.list.schema"

export type ConnectedAccountProvider = z.infer<
  typeof connectedAccountProviderSchema
>
export type LinkAccountInput = z.infer<typeof linkAccountInputSchema>
export type ListProvidersData = z.infer<typeof listProvidersDataSchema>
export type ListProvidersOutput = z.infer<typeof listProvidersOutputSchema>
