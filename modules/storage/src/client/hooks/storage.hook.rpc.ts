"use client"

import {
  InvalidInputClientError,
  isInvalidInputServiceResponse,
  TransientClientError,
  withClientRetry,
} from "@modules/auth"

import {
  isStorageNotProvisionedCode,
  StorageNotProvisionedError,
} from "../utils/storage.provision.errors"
import {
  isStorageQuotaExceededCode,
  StorageQuotaExceededError,
} from "../utils/storage.upload.errors"

function isStorageTransientRpcCode(code: string | undefined): boolean {
  return (
    code === "SERVICE_UNAVAILABLE" ||
    code === "STORAGE_UNAVAILABLE" ||
    code === "auth.no_active_org" ||
    code === "rbac.not_member"
  )
}

export async function callStorageRpc<Data>(
  invoke: () => Promise<{
    status: string
    message: string
    data?: Data | null
    error?: { code?: string }
  }>
): Promise<NonNullable<Data>> {
  return withClientRetry(async () => {
    const response = await invoke()
    if (response.status === "error") {
      const code = response.error?.code
      if (isStorageNotProvisionedCode(code)) {
        throw new StorageNotProvisionedError(response.message)
      }
      if (isStorageQuotaExceededCode(code)) {
        throw new StorageQuotaExceededError(response.message)
      }
      if (isStorageTransientRpcCode(code)) {
        throw new TransientClientError(
          response.message,
          response.error ?? { code: code ?? "STORAGE_UNAVAILABLE" }
        )
      }
      throw new Error(response.message)
    }
    if (response.status === "failed") {
      const failedCode = response.error?.code
      if (isStorageNotProvisionedCode(failedCode)) {
        throw new StorageNotProvisionedError(response.message)
      }
      if (isInvalidInputServiceResponse(response)) {
        throw new InvalidInputClientError(response.message)
      }
      throw new Error(response.message)
    }
    if (response.data == null) {
      throw new Error(response.message)
    }
    return response.data
  })
}
