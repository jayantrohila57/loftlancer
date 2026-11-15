import type { z } from "zod"
import type {
  getLocationDataSchema,
  getLocationOutputSchema,
} from "../validation/location.location.get.schema"
import type { saveLocationInputSchema } from "../validation/location.location.save.schema"
export type LocationState = z.infer<typeof getLocationDataSchema>
export type LocationInput = z.infer<typeof saveLocationInputSchema>

export type LocationOutput = z.infer<typeof getLocationOutputSchema>
