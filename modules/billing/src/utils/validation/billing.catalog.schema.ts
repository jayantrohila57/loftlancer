import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

import { normalizeHostedInvoiceUrl } from "../billing.invoice-row"

const billingHostedInvoiceUrlSchema = z.preprocess(
  (value) => normalizeHostedInvoiceUrl(value as string | null | undefined),
  z.union([z.string().url(), z.null()])
)

const billingInvoiceItemSchema = z.object({
  id: z.string(),
  status: z.string(),
  currency: z.string(),
  totalMinor: z.number().int(),
  amountPaidMinor: z.number().int().nullable(),
  createdAt: z.string().datetime(),
  hostedInvoiceUrl: billingHostedInvoiceUrlSchema,
  invoicePdfUrl: billingHostedInvoiceUrlSchema,
})

export const billingPlansDataSchema = z.object({
  currentPlanTier: z.enum(["free", "paid"]),
  plans: z.array(
    z.object({
      planId: z.string(),
      tier: z.enum(["free", "paid"]),
      quotaBytes: z.number().int().positive(),
      aiEnabled: z.boolean(),
      isCurrent: z.boolean(),
    })
  ),
})

export const billingPlansOutputSchema = serviceResponseSchema(
  billingPlansDataSchema
)

export const billingDowngradeOutputSchema = serviceResponseSchema(
  z.object({
    planTier: z.enum(["free", "paid"]),
    paymentUrl: z.union([z.string().url(), z.null()]),
  })
)

export const billingListInvoicesInputSchema = z.object({
  cursor: z.string().nullable().optional(),
})

export const billingInvoicesOutputSchema = serviceResponseSchema(
  z.object({
    invoices: z.array(billingInvoiceItemSchema),
    nextCursor: z.string().nullable(),
  })
)

export const billingCustomerProfileDataSchema = z.object({
  email: z.string().nullable(),
  name: z.string().nullable(),
  billingDetailsAvailable: z.boolean().optional(),
  paymentMethod: z
    .object({
      brand: z.string(),
      last4: z.string(),
      expMonth: z.number().int(),
      expYear: z.number().int(),
    })
    .nullable(),
  billingDetails: z
    .object({
      line1: z.string().nullable(),
      line2: z.string().nullable(),
      city: z.string().nullable(),
      state: z.string().nullable(),
      postalCode: z.string().nullable(),
      country: z.string().nullable(),
      taxIds: z.array(z.string()),
    })
    .nullable(),
})

export const billingCustomerProfileOutputSchema = serviceResponseSchema(
  billingCustomerProfileDataSchema
)

export const billingSetupPaymentOutputSchema = serviceResponseSchema(
  z.object({
    setupUrl: z.string().url(),
  })
)
