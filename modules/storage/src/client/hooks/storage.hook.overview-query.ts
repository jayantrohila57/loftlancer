"use client"

import { securityRpc } from "@modules/security/client"
import type { StorageOverviewData } from "../../utils/types/storage.types.overview"
import { callStorageRpc } from "./storage.hook.rpc"

export async function fetchStorageOverview(): Promise<StorageOverviewData> {
  return callStorageRpc(() => securityRpc.security.storage.overview())
}
