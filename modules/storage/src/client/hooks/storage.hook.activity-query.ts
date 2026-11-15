"use client"

import { securityRpc } from "@modules/security/client"
import type { StorageActivityData } from "../../utils/types/storage.types.operations"
import { callStorageRpc } from "./storage.hook.rpc"

export async function fetchStorageActivity(input?: {
  cursor?: string
  limit?: number
}): Promise<StorageActivityData> {
  return callStorageRpc(() =>
    securityRpc.security.storage.listActivity({
      cursor: input?.cursor,
      limit: input?.limit,
    })
  )
}
