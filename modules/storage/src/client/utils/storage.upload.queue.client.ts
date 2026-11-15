"use client"

import { ORG_STORAGE_MAX_FILE_BYTES } from "../../utils/constants/storage.constants.limits"
import { isOrgStorageAllowedMime } from "../../utils/constants/storage.constants.mime"
import {
  initOrgStorageUpload,
  uploadOrgStorageFileAfterInit,
} from "./storage.upload.client"
import { StorageQuotaExceededError } from "./storage.upload.errors"

export type StorageUploadProgress = {
  fileName: string
  phase: "init" | "upload" | "done" | "error"
  error?: string
}

type QueueJob = {
  file: File
  folderId?: string
  onProgress: (progress: StorageUploadProgress) => void
  resolve: () => void
  reject: (error: unknown) => void
}

let chain: Promise<void> = Promise.resolve()

function validateUploadFile(file: File): string | null {
  if (file.size > ORG_STORAGE_MAX_FILE_BYTES) {
    return "storageUploadFileTooLarge"
  }
  const mime = file.type || "application/octet-stream"
  if (!isOrgStorageAllowedMime(mime)) {
    return "storageUploadMimeNotAllowed"
  }
  return null
}

function runJob(job: QueueJob) {
  return (async () => {
    const validationKey = validateUploadFile(job.file)
    if (validationKey) {
      job.onProgress({
        fileName: job.file.name,
        phase: "error",
        error: validationKey,
      })
      job.reject(new Error(validationKey))
      return
    }
    job.onProgress({ fileName: job.file.name, phase: "init" })
    try {
      const init = await initOrgStorageUpload({
        displayName: job.file.name,
        byteSize: job.file.size,
        contentType: job.file.type,
        folderId: job.folderId,
      })
      job.onProgress({ fileName: job.file.name, phase: "upload" })
      await uploadOrgStorageFileAfterInit({
        itemId: init.itemId,
        file: job.file,
      })
      job.onProgress({ fileName: job.file.name, phase: "done" })
      job.resolve()
    } catch (error) {
      const message =
        error instanceof StorageQuotaExceededError
          ? "storageUploadQuotaExceeded"
          : error instanceof Error
            ? error.message
            : "storageUploadFailed"
      job.onProgress({
        fileName: job.file.name,
        phase: "error",
        error: message,
      })
      job.reject(error)
    }
  })()
}

export function enqueueOrgStorageUpload(input: {
  file: File
  folderId?: string
  onProgress: (progress: StorageUploadProgress) => void
}) {
  return new Promise<void>((resolve, reject) => {
    const job: QueueJob = {
      file: input.file,
      folderId: input.folderId,
      onProgress: input.onProgress,
      resolve,
      reject,
    }
    chain = chain.then(() => runJob(job))
  })
}
