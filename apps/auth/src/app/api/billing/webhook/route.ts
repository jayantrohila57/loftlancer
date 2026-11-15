import { recordBillingPlanChangedIfNeeded } from "@modules/billing/server"
import { handleAutumnBillingWebhook } from "@packages/billing"

export async function POST(request: Request) {
  const rawBody = await request.text()
  const result = await handleAutumnBillingWebhook({
    rawBody,
    headers: {
      id: request.headers.get("svix-id") ?? request.headers.get("webhook-id"),
      timestamp:
        request.headers.get("svix-timestamp") ??
        request.headers.get("webhook-timestamp"),
      signature:
        request.headers.get("svix-signature") ??
        request.headers.get("webhook-signature"),
    },
  })

  const body = result.body as {
    processed?: boolean
    organizationId?: string
    planTierChanged?: boolean
    planTierBefore?: "free" | "paid"
    planTierAfter?: "free" | "paid"
  }

  if (
    body.processed &&
    body.organizationId &&
    body.planTierChanged &&
    body.planTierBefore &&
    body.planTierAfter
  ) {
    await recordBillingPlanChangedIfNeeded({
      organizationId: body.organizationId,
      source: "webhook",
      sync: {
        planTierBefore: body.planTierBefore,
        planTierAfter: body.planTierAfter,
        planTierChanged: true,
      },
    })
  }

  return Response.json(result.body, { status: result.status })
}
