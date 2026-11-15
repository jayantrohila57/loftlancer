"use client"

import { securityRpc } from "@modules/security/client"
import type { StorageTrashData } from "../../utils/types/storage.types.operations"
import { callStorageRpc } from "./storage.hook.rpc"

export async function fetchStorageTrash(): Promise<StorageTrashData> {
  return callStorageRpc(() => securityRpc.security.storage.listTrash())
}
