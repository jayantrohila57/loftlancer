import { deletedOutputSchema } from "@modules/security/utils"
import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"
import { ACTIVITY_KINDS } from "../constants/activity.constants.activity"

export const deleteActivityPayloadSchema = z.object({
  kind: z.enum(ACTIVITY_KINDS),
})

export const deleteActivityInputSchema = z.object({
  payload: deleteActivityPayloadSchema,
})

export const deleteActivityOutputSchema =
  serviceResponseSchema(deletedOutputSchema)
