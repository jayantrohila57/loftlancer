import type { z } from "zod"

import type { aiUsageOverviewDataSchema } from "../validation/ai-usage.overview.schema"

export type AiUsageOverviewData = z.infer<typeof aiUsageOverviewDataSchema>
