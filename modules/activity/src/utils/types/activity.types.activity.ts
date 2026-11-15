import type { z } from "zod"
import type {
  deleteActivityInputSchema,
  deleteActivityPayloadSchema,
} from "../validation/activity.activity.delete.schema"
import type {
  listActivityInputSchema,
  listActivityOutputSchema,
  listActivityQuerySchema,
} from "../validation/activity.activity.list.schema"

export type ListActivityInput = z.infer<typeof listActivityInputSchema>
export type ListActivityOutput = z.infer<typeof listActivityOutputSchema>
export type DeleteActivityInput = z.infer<typeof deleteActivityInputSchema>

export type ListActivityQuery = z.infer<typeof listActivityQuerySchema>
export type DeleteActivityPayload = z.infer<typeof deleteActivityPayloadSchema>
