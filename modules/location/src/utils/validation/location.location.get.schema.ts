import { point } from "@modules/security/utils"
import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const getLocationDataSchema = z.object({
  enabled: z.boolean(),
  decided: z.boolean(),
  generation: z.number().int().nonnegative(),
  location: point.nullable(),
})

export const getLocationOutputSchema = serviceResponseSchema(
  getLocationDataSchema
)
