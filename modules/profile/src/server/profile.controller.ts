import { avatarUploadResponseSchema } from "../utils/validation/profile.validation.avatar"
import { profileService } from "./services/profile.service.router"

export async function uploadAvatarController(file: File) {
  return avatarUploadResponseSchema.parse(
    await profileService.uploadAvatar(file)
  )
}
