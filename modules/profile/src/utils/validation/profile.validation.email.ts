import { z } from "zod"

export const profileChangeEmailInputSchema = z.object({
  newEmail: z.email(),
})

export type ProfileChangeEmailInput = z.infer<
  typeof profileChangeEmailInputSchema
>
