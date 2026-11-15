import type { z } from "zod"

import type { storageListDataSchema } from "../validation/storage.list.schema"

export type StorageListData = z.infer<typeof storageListDataSchema>
