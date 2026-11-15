import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"
import {
  organizationSetupPatchSchema,
  organizationSetupSchemaV2,
} from "./org.setup.schema"

export const orgSetupGetOutputSchema = serviceResponseSchema(
  z.object({
    setup: organizationSetupSchemaV2.nullable(),
  })
)

export const orgSetupPatchInputSchema = z.object({
  patch: organizationSetupPatchSchema,
})

export const orgSetupPatchOutputSchema = serviceResponseSchema(
  z.object({
    setup: organizationSetupSchemaV2,
  })
)
