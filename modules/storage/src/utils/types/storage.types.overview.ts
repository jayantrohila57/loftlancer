import type { z } from "zod"

import type { storageOverviewDataSchema } from "../validation/storage.overview.schema"

export type StorageOverviewData = z.infer<typeof storageOverviewDataSchema>
