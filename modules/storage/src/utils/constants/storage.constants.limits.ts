/** Max single org hub file (multipart HTTP route). */
export const ORG_STORAGE_MAX_FILE_BYTES = 4 * 1024 * 1024

export const ORG_STORAGE_MULTIPART_OVERHEAD_BYTES = 256 * 1024

/** Signed download URL TTL (ms). */
export const ORG_STORAGE_SIGNED_URL_TTL_MS = 60 * 60 * 1000

/** Trash retention before automatic blob purge. */
export const ORG_STORAGE_TRASH_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

export const ORG_STORAGE_MAX_FOLDER_DEPTH = 5

export const ORG_STORAGE_BLOB_ORG_PREFIX = "loftlancer/orgs/"

export const PERSONAL_AVATAR_BLOB_PREFIX = "loftlancer/avatars/"
