import { Webhook } from "standardwebhooks"

export function verifyAutumnWebhookSignatureWithSecret(input: {
  secret: string
  rawBody: string
  headers: {
    id: string | null
    timestamp: string | null
    signature: string | null
  }
}) {
  const { id, timestamp, signature } = input.headers
  if (!input.secret || !id || !timestamp || !signature) return false
  try {
    new Webhook(input.secret).verify(
      input.rawBody,
      {
        "webhook-id": id,
        "webhook-timestamp": timestamp,
        "webhook-signature": signature,
      },
      { jsonParse: false }
    )
    return true
  } catch {
    return false
  }
}
