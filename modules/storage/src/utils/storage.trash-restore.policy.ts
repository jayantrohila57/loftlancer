import { ORG_STORAGE_TRASH_RETENTION_MS } from "./constants/storage.constants.limits"

export function isTrashRetentionExpired(input: {
  trashedAt: Date
  now: Date
  retentionMs?: number
}) {
  const retentionMs = input.retentionMs ?? ORG_STORAGE_TRASH_RETENTION_MS
  return input.trashedAt.getTime() + retentionMs <= input.now.getTime()
}

export function isListedTrashedItem(input: {
  trashedAt: Date | null
  purgedAt: Date | null
  now: Date
  retentionMs?: number
}) {
  if (!input.trashedAt || input.purgedAt) {
    return false
  }
  return !isTrashRetentionExpired({
    trashedAt: input.trashedAt,
    now: input.now,
    retentionMs: input.retentionMs,
  })
}

export type RestoreTrashedItemDecision =
  | { ok: true; targetFolderId: string; relocated: boolean }
  | {
      ok: false
      status: "NOT_FOUND" | "CONFLICT"
      code:
        | "storage.item_not_found"
        | "storage.trash_expired"
        | "storage.trash_purged"
        | "storage.blob_missing"
        | "storage.name_conflict"
      message: string
    }

export function validateTrashedItemRestore(input: {
  status: string
  purgedAt: Date | null
  trashedAt: Date | null
  blobExists: boolean
  folderId: string | null
  rootFolderId: string | null
  originalFolderExists: boolean
  conflictingActiveItemId: string | null
  now: Date
  retentionMs?: number
}): RestoreTrashedItemDecision {
  if (input.status !== "trash" || !input.trashedAt) {
    return {
      ok: false,
      status: "NOT_FOUND",
      code: "storage.item_not_found",
      message: "Trashed file not found.",
    }
  }
  if (input.purgedAt) {
    return {
      ok: false,
      status: "NOT_FOUND",
      code: "storage.trash_purged",
      message: "This file was permanently deleted and cannot be restored.",
    }
  }
  if (
    isTrashRetentionExpired({
      trashedAt: input.trashedAt,
      now: input.now,
      retentionMs: input.retentionMs,
    })
  ) {
    return {
      ok: false,
      status: "NOT_FOUND",
      code: "storage.trash_expired",
      message:
        "This file is past the 7-day retention window and cannot be restored.",
    }
  }
  if (!input.blobExists) {
    return {
      ok: false,
      status: "NOT_FOUND",
      code: "storage.blob_missing",
      message: "The file content is missing and cannot be restored.",
    }
  }

  let targetFolderId = input.folderId
  let relocated = false
  if (!targetFolderId || !input.originalFolderExists) {
    if (!input.rootFolderId) {
      return {
        ok: false,
        status: "NOT_FOUND",
        code: "storage.item_not_found",
        message: "Trashed file not found.",
      }
    }
    targetFolderId = input.rootFolderId
    relocated = input.folderId !== input.rootFolderId
  }

  if (input.conflictingActiveItemId) {
    return {
      ok: false,
      status: "CONFLICT",
      code: "storage.name_conflict",
      message: "Another file already uses this name in the destination folder.",
    }
  }

  return { ok: true, targetFolderId, relocated }
}
