import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const saveLocationInputSchema = z
  .object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    accuracyMeters: z.number().finite().min(0).max(20000000),
    generation: z.number().int().nonnegative(),
  })
  .strict()
export const saveLocationDataSchema = z.object({ capturedAt: z.date() })

export const saveLocationRequestSchema = z.object({
  payload: saveLocationInputSchema,
})
export const saveLocationOutputSchema = serviceResponseSchema(
  saveLocationDataSchema
)
