import type { z } from "zod"

import type { aiUsageHistoryDataSchema } from "../validation/ai-usage.history.schema"

export type AiUsageHistoryData = z.infer<typeof aiUsageHistoryDataSchema>
