/** Keep in sync with BILLING_PAYMENT_GRACE_DAYS in billing.plan-config.ts. */
const DEFAULT_PAYMENT_GRACE_DAYS = 7

export type BillingWebhookKind =
  | "created"
  | "updated"
  | "canceled"
  | "payment_failed"
  | "invoice_paid"
  | "other"

function normalizeWebhookType(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

export function classifyBillingWebhookEvent(input: {
  eventType?: unknown
  payload?: unknown
}): BillingWebhookKind {
  const type = normalizeWebhookType(input.eventType)
  const payload =
    input.payload && typeof input.payload === "object"
      ? (input.payload as Record<string, unknown>)
      : {}
  const nestedType = normalizeWebhookType(
    payload.type ?? payload.event_type ?? payload.eventType
  )
  const token = `${type} ${nestedType}`.trim()

  if (
    /(invoice[._-]?(payment[._-]?)?failed|payment[._-]?failed|charge[._-]?failed)/.test(
      token
    )
  ) {
    return "payment_failed"
  }
  if (
    /(invoice[._-]?(payment[._-]?)?paid|invoice[._-]?payment[._-]?succeeded|payment[._-]?succeeded|invoice[._-]?paid)/.test(
      token
    )
  ) {
    return "invoice_paid"
  }
  if (
    /(subscription[._-]?(canceled|cancelled)|customer[._-]?deleted)/.test(token)
  ) {
    return "canceled"
  }
  if (/(subscription[._-]?created|customer[._-]?created)/.test(token)) {
    return "created"
  }
  if (/(subscription[._-]?updated|customer[._-]?updated|updated)/.test(token)) {
    return "updated"
  }
  if (/(canceled|cancelled)/.test(token)) {
    return "canceled"
  }
  if (/(created)/.test(token)) {
    return "created"
  }
  return "other"
}

export function paymentGraceDaysFromEnv(value: number | undefined): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value)
  }
  return DEFAULT_PAYMENT_GRACE_DAYS
}

export function computePaymentGraceUntil(input?: {
  now?: Date
  days?: number
}): Date {
  const now = input?.now ?? new Date()
  const days = paymentGraceDaysFromEnv(input?.days)
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
}

export function isPaymentGraceExpired(input: {
  paymentGraceUntil: Date | string | null | undefined
  now?: Date
}): boolean {
  if (!input.paymentGraceUntil) return false
  const until = new Date(input.paymentGraceUntil)
  if (Number.isNaN(until.getTime())) return false
  return until.getTime() <= (input.now ?? new Date()).getTime()
}

export function usageWarningLevel(input: {
  used: number
  included: number
  warningRatio?: number
}): "none" | "approaching" | "exhausted" {
  if (input.included <= 0) {
    return input.used > 0 ? "exhausted" : "none"
  }
  if (input.used >= input.included) return "exhausted"
  const ratio = input.warningRatio ?? 0.8
  if (input.used / input.included >= ratio) return "approaching"
  return "none"
}

export function extractCancelAtPeriodEnd(customer: unknown): boolean {
  if (!customer || typeof customer !== "object") return false
  const record = customer as Record<string, unknown>
  const collections: unknown[] = [
    record.subscriptions,
    record.cusProducts,
    record.customerProducts,
  ]
  for (const collection of collections) {
    if (!Array.isArray(collection)) continue
    for (const item of collection) {
      if (!item || typeof item !== "object") continue
      const row = item as Record<string, unknown>
      if (row.canceled === true || row.cancelled === true) return true
      if (row.cancelAtPeriodEnd === true || row.cancel_at_period_end === true) {
        return true
      }
      const status = String(row.status ?? "").toLowerCase()
      if (status.includes("cancel")) return true
    }
  }
  return false
}
