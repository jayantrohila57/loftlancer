import type { z } from "zod"
import type { billingInvoicesOutputSchema } from "../validation/billing.catalog.schema"

export type BillingInvoicesListData =
  z.infer<typeof billingInvoicesOutputSchema> extends {
    data: infer D
  }
    ? NonNullable<D>
    : never
