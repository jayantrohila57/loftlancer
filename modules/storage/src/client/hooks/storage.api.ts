"use client"

import { useStorageActivity } from "./storage.hook.activity"
import {
  useStorageGrantMutations,
  useStorageGrants,
} from "./storage.hook.grants"
import { useStorageList } from "./storage.hook.list"
import { useStorageOverview } from "./storage.hook.overview"
import {
  usePurgeStorageItem,
  useRestoreStorageItem,
  useStorageTrash,
} from "./storage.hook.trash"

export const useStorageApi = {
  useOverview: useStorageOverview,
  useList: useStorageList,
  useTrash: useStorageTrash,
  useRestoreItem: useRestoreStorageItem,
  usePurgeItem: usePurgeStorageItem,
  useGrants: useStorageGrants,
  useGrantMutations: useStorageGrantMutations,
  useActivity: useStorageActivity,
}
