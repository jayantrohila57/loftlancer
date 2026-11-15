const RESTORE_ERROR_CODES = {
  expired: "storage.trash_expired",
  purged: "storage.trash_purged",
  missing: "storage.blob_missing",
  conflict: "storage.name_conflict",
} as const

export function storageTrashRestoreMessage(
  t: (
    key:
      | "storageTrashRestoreExpired"
      | "storageTrashRestorePurged"
      | "storageTrashRestoreMissingObject"
      | "storageTrashRestoreConflict"
      | "storageTrashRestoreError"
  ) => string,
  error: unknown
) {
  const message = error instanceof Error ? error.message : ""
  const code =
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code?: string }).code === "string"
      ? (error as { code: string }).code
      : undefined

  if (code === RESTORE_ERROR_CODES.expired) {
    return t("storageTrashRestoreExpired")
  }
  if (code === RESTORE_ERROR_CODES.purged) {
    return t("storageTrashRestorePurged")
  }
  if (code === RESTORE_ERROR_CODES.missing) {
    return t("storageTrashRestoreMissingObject")
  }
  if (code === RESTORE_ERROR_CODES.conflict) {
    return t("storageTrashRestoreConflict")
  }

  if (message.includes("retention window")) {
    return t("storageTrashRestoreExpired")
  }
  if (message.includes("permanently deleted")) {
    return t("storageTrashRestorePurged")
  }
  if (message.includes("content is missing")) {
    return t("storageTrashRestoreMissingObject")
  }
  if (message.includes("already uses this name")) {
    return t("storageTrashRestoreConflict")
  }

  return message || t("storageTrashRestoreError")
}
