import { z } from "zod"

export const deviceAuthorizationUserCodeSchema = z.object({
  userCode: z
    .string()
    .min(4, "required")
    .max(32)
    .regex(/^[a-zA-Z0-9-]+$/, "format"),
})

export type DeviceAuthorizationUserCodeValues = z.infer<
  typeof deviceAuthorizationUserCodeSchema
>
