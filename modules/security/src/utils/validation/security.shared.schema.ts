import { z } from "zod"

export const nullableText = z.string().nullable()
export const point = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracyMeters: z.number(),
  capturedAt: z.date(),
})
export const deletedOutputSchema = z.object({ deleted: z.boolean() })
