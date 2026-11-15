"use client"

import { securityRpc } from "@modules/security/client"

import { callStorageRpc } from "./storage.hook.rpc"

export async function fetchStorageDownloadUrl(itemId: string) {
  return callStorageRpc(() =>
    securityRpc.security.storage.downloadUrl({ itemId })
  )
}
