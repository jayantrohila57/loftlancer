import type { z } from "zod"
import type { profileUpdateInputSchema } from "../validation/profile.validation.update"

export type ProfileUpdateInput = z.infer<typeof profileUpdateInputSchema>
