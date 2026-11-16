import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { Webhook } from "standardwebhooks"

import {
  classifyBillingWebhookEvent,
  computePaymentGraceUntil,
  extractCancelAtPeriodEnd,
  isPaymentGraceExpired,
  paymentGraceDaysFromEnv,
  usageWarningLevel,
} from "./billing.webhook-events.ts"
import { verifyAutumnWebhookSignatureWithSecret } from "./billing.webhook-signature.ts"

describe("classifyBillingWebhookEvent", () => {
  it("classifies created, updated, canceled, payment failed, and invoice paid", () => {
    assert.equal(
      classifyBillingWebhookEvent({ eventType: "customer.created" }),
      "created"
    )
    assert.equal(
      classifyBillingWebhookEvent({ eventType: "subscription.updated" }),
      "updated"
    )
    assert.equal(
      classifyBillingWebhookEvent({ eventType: "subscription.canceled" }),
      "canceled"
    )
    assert.equal(
      classifyBillingWebhookEvent({ eventType: "invoice.payment_failed" }),
      "payment_failed"
    )
    assert.equal(
      classifyBillingWebhookEvent({ eventType: "invoice.paid" }),
      "invoice_paid"
    )
    assert.equal(
      classifyBillingWebhookEvent({ eventType: "invoice.payment_succeeded" }),
      "invoice_paid"
    )
    assert.equal(classifyBillingWebhookEvent({ eventType: "ping" }), "other")
  })
})

describe("payment grace", () => {
  it("defaults to seven days and expires after the deadline", () => {
    assert.equal(paymentGraceDaysFromEnv(undefined), 7)
    assert.equal(paymentGraceDaysFromEnv(14), 14)
    const now = new Date("2026-11-16T10:00:00.000Z")
    const until = computePaymentGraceUntil({ now, days: 7 })
    assert.equal(until.toISOString(), "2026-11-23T10:00:00.000Z")
    assert.equal(
      isPaymentGraceExpired({ paymentGraceUntil: until, now }),
      false
    )
    assert.equal(
      isPaymentGraceExpired({
        paymentGraceUntil: until,
        now: new Date("2026-11-23T10:00:00.000Z"),
      }),
      true
    )
  })
})

describe("usageWarningLevel", () => {
  it("warns at 80% and exhausts at 100%", () => {
    assert.equal(usageWarningLevel({ used: 79, included: 100 }), "none")
    assert.equal(usageWarningLevel({ used: 80, included: 100 }), "approaching")
    assert.equal(usageWarningLevel({ used: 100, included: 100 }), "exhausted")
    assert.equal(usageWarningLevel({ used: 1, included: 0 }), "exhausted")
  })
})

describe("extractCancelAtPeriodEnd", () => {
  it("reads cancel flags from customer subscriptions", () => {
    assert.equal(extractCancelAtPeriodEnd({ subscriptions: [] }), false)
    assert.equal(
      extractCancelAtPeriodEnd({
        subscriptions: [{ cancelAtPeriodEnd: true, status: "active" }],
      }),
      true
    )
    assert.equal(
      extractCancelAtPeriodEnd({
        subscriptions: [{ status: "canceled" }],
      }),
      true
    )
  })
})

describe("verifyAutumnWebhookSignatureWithSecret", () => {
  it("accepts a standardwebhooks-signed fixture and rejects a bad signature", () => {
    const secret = `whsec_${Buffer.from("test-webhook-secret").toString("base64")}`
    const rawBody = JSON.stringify({
      type: "invoice.payment_failed",
      data: { customer_id: "cus_test" },
    })
    const timestamp = new Date()
    const signed = new Webhook(secret).sign("evt_test_1", timestamp, rawBody)
    const headers = {
      id: "evt_test_1",
      timestamp: String(Math.floor(timestamp.getTime() / 1000)),
      signature: signed,
    }
    assert.equal(
      verifyAutumnWebhookSignatureWithSecret({ secret, rawBody, headers }),
      true
    )
    assert.equal(
      verifyAutumnWebhookSignatureWithSecret({
        secret,
        rawBody,
        headers: { ...headers, signature: "v1,deadbeef" },
      }),
      false
    )
  })
})
