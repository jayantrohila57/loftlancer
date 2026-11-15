import { logger } from "@packages/logger/server"
import { createError, createFailed, createSuccess } from "@packages/orpc"
import { PROFILE_AVATAR_MAX_BYTES } from "../../utils/constants/profile.constants.avatar"
import { profileRepository } from "../repositories/profile.repository.router"

export async function uploadAvatar(file: File) {
  if (file.size === 0 || file.size > PROFILE_AVATAR_MAX_BYTES)
    return createFailed("Choose an image of 5 MB or smaller.", {
      code: "INVALID_FILE",
    })
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const png =
      bytes.length >= 8 &&
      [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
    const jpg =
      bytes.length >= 3 &&
      bytes[0] === 255 &&
      bytes[1] === 216 &&
      bytes[2] === 255
    const gif =
      bytes.length >= 6 &&
      ["GIF87a", "GIF89a"].includes(new TextDecoder().decode(bytes.slice(0, 6)))
    const webp =
      bytes.length >= 12 &&
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
    const kind: readonly [string, string] | null = png
      ? ["png", "image/png"]
      : jpg
        ? ["jpg", "image/jpeg"]
        : gif
          ? ["gif", "image/gif"]
          : webp
            ? ["webp", "image/webp"]
            : null
    if (!kind || file.type !== kind[1])
      return createFailed("Unsupported image format.", {
        code: "UNSUPPORTED_FORMAT",
      })
    return createSuccess(
      await profileRepository.storeAvatar(file, kind[0], kind[1]),
      "Image uploaded."
    )
  } catch {
    logger.error("service.failed", {
      app: "auth",
      module: "profile",
      outcome: "error",
      errorCode: "UPLOAD_FAILED",
    })
    return createError("Image upload failed. Please try again.", {
      code: "UPLOAD_FAILED",
    })
  }
}
