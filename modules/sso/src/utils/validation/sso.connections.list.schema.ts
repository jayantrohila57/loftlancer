import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const listSsoConnectionsInputSchema = z.object({}).strict()

export const ssoConnectionProtocolSchema = z.enum([
  "oidc",
  "saml",
  "unconfigured",
])

export const ssoConnectionListItemSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  domain: z.string(),
  issuer: z.string(),
  protocol: ssoConnectionProtocolSchema,
  organizationId: z.string().nullable(),
})

export const listSsoConnectionsDataSchema = z.object({
  connections: z.array(ssoConnectionListItemSchema),
})

export const listSsoConnectionsOutputSchema = serviceResponseSchema(
  listSsoConnectionsDataSchema
)
