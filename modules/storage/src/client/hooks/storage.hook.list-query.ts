"use client"

import { securityRpc } from "@modules/security/client"
import type { StorageListData } from "../../utils/types/storage.types.list"
import { callStorageRpc } from "./storage.hook.rpc"

export async function fetchStorageList(input?: {
  folderId?: string
}): Promise<StorageListData> {
  return callStorageRpc(() =>
    securityRpc.security.storage.list(
      input?.folderId ? { folderId: input.folderId } : {}
    )
  )
}
