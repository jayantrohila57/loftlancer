export const STORAGE_NOT_PROVISIONED_CODE = "STORAGE_NOT_PROVISIONED" as const

export function isStorageNotProvisionedCode(code: string | undefined): boolean {
  return code === STORAGE_NOT_PROVISIONED_CODE
}

export class StorageNotProvisionedError extends Error {
  readonly code = STORAGE_NOT_PROVISIONED_CODE

  constructor(message: string) {
    super(message)
    this.name = "StorageNotProvisionedError"
  }
}

export function isStorageNotProvisionedError(
  error: unknown
): error is StorageNotProvisionedError {
  return error instanceof StorageNotProvisionedError
}
