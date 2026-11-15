import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { ListInvoicesStatus } from "autumn-js"

import { mapAutumnInvoiceRow } from "../../utils/billing.invoice-row"
import { requireBillingAutumnContext } from "../shared/billing.autumn-context"

function invoicesProviderFailed() {
  return new ORPCError("SERVICE_UNAVAILABLE", {
    message: "Could not load invoices.",
    data: { code: "billing.invoices_failed" },
  })
}

export async function billingListInvoicesService(input: {
  organizationId: string
  paidOnly?: boolean
  limit?: number
  cursor?: string | null
}) {
  const { client, customerId } = await requireBillingAutumnContext(input)

  let response: Awaited<ReturnType<typeof client.invoices.list>>
  try {
    response = await client.invoices.list({
      customerId,
      limit: input.limit ?? 50,
      startCursor: input.cursor ?? undefined,
      status: input.paidOnly ? [ListInvoicesStatus.Paid] : undefined,
    })
  } catch {
    throw invoicesProviderFailed()
  }

  if (!Array.isArray(response.list)) {
    throw invoicesProviderFailed()
  }

  return createSuccess(
    {
      invoices: response.list.map(mapAutumnInvoiceRow),
      nextCursor: response.nextCursor ?? null,
    },
    "Invoices loaded."
  )
}
