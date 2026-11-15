import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { CustomerExpand } from "autumn-js"

import { summarizePaymentMethod } from "../../utils/billing.payment-method"
import { requireBillingAutumnContext } from "../shared/billing.autumn-context"

function customerProfileProviderFailed() {
  return new ORPCError("SERVICE_UNAVAILABLE", {
    message: "Could not load billing profile.",
    data: { code: "billing.customer_profile_failed" },
  })
}

export async function billingCustomerProfileService(input: {
  organizationId: string
}) {
  const { client, customerId } = await requireBillingAutumnContext(input)

  let customer: Awaited<ReturnType<typeof client.customers.get>>
  let billingDetailsAvailable = true
  try {
    customer = await client.customers.get({
      customerId,
      expand: [CustomerExpand.PaymentMethod, CustomerExpand.BillingDetails],
    })
  } catch {
    // Older self-hosted Autumn versions support payment methods but reject
    // the billing-details expansion. Keep the payment screen usable while
    // reporting that billing details could not be read.
    try {
      customer = await client.customers.get({
        customerId,
        expand: [CustomerExpand.PaymentMethod],
      })
      billingDetailsAvailable = false
    } catch {
      throw customerProfileProviderFailed()
    }
  }

  if (!customer || typeof customer !== "object") {
    throw customerProfileProviderFailed()
  }

  const paymentMethod = summarizePaymentMethod(customer.paymentMethod)
  const address = customer.billingDetails?.address
  const taxIds =
    customer.billingDetails?.taxIds
      ?.map((entry) => entry.value)
      .filter((value): value is string => typeof value === "string") ?? []

  return createSuccess(
    {
      email: customer.email,
      name: customer.name,
      paymentMethod,
      billingDetailsAvailable,
      billingDetails: address
        ? {
            line1: address.line1 ?? null,
            line2: address.line2 ?? null,
            city: address.city ?? null,
            state: address.state ?? null,
            postalCode: address.postalCode ?? null,
            country: address.country ?? null,
            taxIds,
          }
        : null,
    },
    "Billing profile loaded."
  )
}
