import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const updateLocationPreferenceSchema = z
  .object({ enabled: z.boolean() })
  .strict()

export const preferenceInputSchema = z.object({
  payload: updateLocationPreferenceSchema,
})
export const preferenceOutputSchema = serviceResponseSchema(
  updateLocationPreferenceSchema
)
