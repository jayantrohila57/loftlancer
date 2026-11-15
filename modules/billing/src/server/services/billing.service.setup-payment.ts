import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"

import { requireBillingAutumnContext } from "../shared/billing.autumn-context"

export async function billingSetupPaymentService(input: {
  organizationId: string
}) {
  const { client, customerId } = await requireBillingAutumnContext(input)

  const session = await client.billing.setupPayment({ customerId })
  const setupUrl = session.url
  if (!setupUrl) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Could not create a payment setup session.",
      data: { code: "billing.setup_payment_failed" },
    })
  }

  return createSuccess({ setupUrl }, "Payment setup session created.")
}
