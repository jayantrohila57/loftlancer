import { z } from "zod"

import { profileDisplayNameSchema } from "./profile.validation.name"

/** Account email changes use Better Auth `changeEmail`, not `updateUser`. */
export const profileUpdateInputSchema = z.object({
  name: profileDisplayNameSchema.optional(),
  image: z.string().nullable().optional(),
})

export { profileChangeEmailInputSchema } from "./profile.validation.email"
