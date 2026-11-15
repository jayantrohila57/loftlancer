export const STORAGE_QUOTA_EXCEEDED_CODE = "quota.storage_exceeded" as const

export function isStorageQuotaExceededCode(code: string | undefined): boolean {
  return code === STORAGE_QUOTA_EXCEEDED_CODE
}

export class StorageQuotaExceededError extends Error {
  readonly code = STORAGE_QUOTA_EXCEEDED_CODE

  constructor(message: string) {
    super(message)
    this.name = "StorageQuotaExceededError"
  }
}
