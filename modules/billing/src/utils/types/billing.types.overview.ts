import type { z } from "zod"
import type { billingOverviewDataSchema } from "../validation/billing.overview.schema"

export type BillingOverviewData = z.infer<typeof billingOverviewDataSchema>
