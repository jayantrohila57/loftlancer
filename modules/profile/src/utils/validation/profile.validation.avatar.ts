import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const avatarUploadDataSchema = z.object({ url: z.string().url() })
export const avatarUploadResponseSchema = serviceResponseSchema(
  avatarUploadDataSchema
)
export const avatarFormSchema = z.object({
  image: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true
      try {
        return new URL(value).protocol === "https:"
      } catch {
        return false
      }
    }, "Enter a valid HTTPS image URL."),
})
