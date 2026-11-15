import type { z } from "zod"
import type {
  storageListActivityDataSchema,
  storageListTrashDataSchema,
} from "../validation/storage.operations.schema"

export type StorageTrashData = z.infer<typeof storageListTrashDataSchema>
export type StorageActivityData = z.infer<typeof storageListActivityDataSchema>
