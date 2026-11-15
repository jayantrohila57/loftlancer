import { put } from "@packages/blob"

export async function storeAvatar(
  file: File,
  extension: string,
  contentType: string
) {
  const blob = await put(
    `loftlancer/avatars/${crypto.randomUUID()}.${extension}`,
    file,
    { access: "public", contentType, addRandomSuffix: true }
  )
  return { url: blob.url }
}
