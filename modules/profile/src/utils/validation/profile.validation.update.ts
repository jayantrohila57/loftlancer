import { z } from "zod"

import { profileDisplayNameSchema } from "./profile.validation.name"

export const profileUpdateInputSchema = z.object({
  name: profileDisplayNameSchema.optional(),
  image: z.string().nullable().optional(),
})
