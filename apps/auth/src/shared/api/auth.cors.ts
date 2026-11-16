import { getTrustedAuthOrigins } from "@packages/better-auth"

export function corsHeadersForTrustedOrigin(request: Request): Headers {
  const headers = new Headers({ Vary: "Origin" })
  const origin = request.headers.get("origin")
  if (origin && getTrustedAuthOrigins().includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin)
    headers.set("Access-Control-Allow-Credentials", "true")
  }
  return headers
}

export function billingCorsPreflight(request: Request): Response {
  const headers = corsHeadersForTrustedOrigin(request)
  if (!headers.has("Access-Control-Allow-Origin")) {
    return new Response(null, { status: 403, headers })
  }
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "content-type")
  headers.set("Access-Control-Max-Age", "600")
  return new Response(null, { status: 204, headers })
}

export function jsonWithCors(
  request: Request,
  body: unknown,
  status = 200
): Response {
  const headers = corsHeadersForTrustedOrigin(request)
  headers.set("Cache-Control", "no-store")
  return Response.json(body, { status, headers })
}
