import { z } from "zod"

const hostedInvoiceUrlSchema = z.string().url()

export function normalizeHostedInvoiceUrl(
  value: string | null | undefined
): string | null {
  if (value == null || value.trim() === "") {
    return null
  }
  const parsed = hostedInvoiceUrlSchema.safeParse(value.trim())
  if (!parsed.success) {
    return null
  }
  try {
    const url = new URL(parsed.data)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null
    }
    return url.href
  } catch {
    return null
  }
}

export function mapAutumnInvoiceRow(invoice: {
  id: string
  status: string
  currency: string
  total: number
  amountPaid: number | null
  createdAt: number
  hostedInvoiceUrl?: string | null
}) {
  const createdAt = new Date(invoice.createdAt)
  return {
    id: invoice.id,
    status: invoice.status,
    currency: invoice.currency,
    totalMinor: invoice.total,
    amountPaidMinor: invoice.amountPaid,
    createdAt: Number.isNaN(createdAt.getTime())
      ? new Date(0).toISOString()
      : createdAt.toISOString(),
    hostedInvoiceUrl: normalizeHostedInvoiceUrl(invoice.hostedInvoiceUrl),
  }
}
