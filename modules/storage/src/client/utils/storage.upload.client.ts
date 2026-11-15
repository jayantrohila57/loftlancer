"use client"

import { securityRpc } from "@modules/security/client"
import { clientEnv } from "@packages/t3-env/client"
import { z } from "zod"

import { callStorageRpc } from "../hooks/storage.hook.rpc"

const uploadCompleteSchema = z.object({
  itemId: z.string().min(1),
  displayName: z.string(),
})

const uploadErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
})

export type InitOrgStorageUploadInput = {
  displayName: string
  byteSize: number
  contentType: string
  folderId?: string
}

export async function initOrgStorageUpload(input: InitOrgStorageUploadInput) {
  return callStorageRpc(() =>
    securityRpc.security.storage.initUpload({
      displayName: input.displayName,
      byteSize: input.byteSize,
      contentType: input.contentType,
      folderId: input.folderId,
    })
  )
}

export async function uploadOrgStorageFileAfterInit(input: {
  itemId: string
  file: File
}) {
  const body = new FormData()
  body.set("file", input.file)
  body.set("itemId", input.itemId)

  const base = new URL(clientEnv.NEXT_PUBLIC_AUTH_APP_URL).pathname.replace(
    /\/$/,
    ""
  )
  const response = await fetch(`${base}/api/storage/upload`, {
    method: "POST",
    body,
    credentials: "include",
  })

  let result: unknown
  try {
    result = await response.json()
  } catch {
    result = null
  }

  const parsed = uploadCompleteSchema.safeParse(result)
  if (!response.ok || !parsed.success) {
    const error = uploadErrorSchema.safeParse(result)
    throw new Error(
      error.success ? error.data.error : "Organization file upload failed."
    )
  }
  return parsed.data
}
