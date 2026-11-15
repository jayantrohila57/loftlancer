import type { z } from "zod"
import type {
  avatarFormSchema,
  avatarUploadDataSchema,
  avatarUploadResponseSchema,
} from "../validation/profile.validation.avatar"

export type AvatarFormInput = z.infer<typeof avatarFormSchema>
export type AvatarUploadData = z.infer<typeof avatarUploadDataSchema>
export type AvatarUploadResponse = z.infer<typeof avatarUploadResponseSchema>
