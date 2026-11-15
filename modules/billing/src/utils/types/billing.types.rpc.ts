import type { z } from "zod"

import type {
  billingCustomerProfileDataSchema,
  billingDowngradeOutputSchema,
  billingInvoicesOutputSchema,
  billingPlansDataSchema,
  billingSetupPaymentOutputSchema,
} from "../validation/billing.catalog.schema"
import type { billingUpgradeOutputSchema } from "../validation/billing.overview.schema"

type ResponseData<Schema extends z.ZodTypeAny> = NonNullable<
  z.infer<Schema> extends { data: infer Data } ? Data : never
>

export type BillingInvoicesListData = ResponseData<
  typeof billingInvoicesOutputSchema
>
export type BillingPlansData = z.infer<typeof billingPlansDataSchema>
export type BillingCustomerProfileData = z.infer<
  typeof billingCustomerProfileDataSchema
>
export type BillingDowngradeData = ResponseData<
  typeof billingDowngradeOutputSchema
>
export type BillingUpgradeData = ResponseData<typeof billingUpgradeOutputSchema>
export type BillingSetupPaymentData = ResponseData<
  typeof billingSetupPaymentOutputSchema
>
