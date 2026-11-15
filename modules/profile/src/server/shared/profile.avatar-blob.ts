import { PROFILE_AVATAR_BLOB_PATH_PREFIX } from "../../utils/constants/profile.constants.avatar"

export function isStoredProfileAvatarBlobUrl(
  url: string | null | undefined
): url is string {
  if (!url) return false
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return false
    if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com"))
      return false
    const pathname = decodeURIComponent(parsed.pathname.replace(/^\//, ""))
    return pathname.startsWith(PROFILE_AVATAR_BLOB_PATH_PREFIX)
  } catch {
    return false
  }
}
