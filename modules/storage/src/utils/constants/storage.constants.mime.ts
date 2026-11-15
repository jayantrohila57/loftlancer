export const ORG_STORAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const

export type OrgStorageAllowedMime =
  (typeof ORG_STORAGE_ALLOWED_MIME_TYPES)[number]

const MIME_TO_EXT: Record<OrgStorageAllowedMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
}

export function extensionForOrgStorageMime(mime: OrgStorageAllowedMime) {
  return MIME_TO_EXT[mime]
}

export function isOrgStorageAllowedMime(
  mime: string
): mime is OrgStorageAllowedMime {
  return (ORG_STORAGE_ALLOWED_MIME_TYPES as readonly string[]).includes(mime)
}
