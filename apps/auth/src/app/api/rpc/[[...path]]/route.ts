import "@/shared/auth/auth.bootstrap"

import { securityRouter } from "@modules/security/server"
import { getTrustedAuthOrigins } from "@packages/better-auth"
import { RPCHandler } from "@packages/orpc/server"

import { corsHeadersForTrustedOrigin } from "@/shared/api/auth.cors"

const handler = new RPCHandler({ security: securityRouter })

function isTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin) return request.method === "GET"
  if (origin === new URL(request.url).origin) return true
  return getTrustedAuthOrigins().includes(origin)
}

async function handle(request: Request) {
  if (request.method !== "GET" && !isTrustedOrigin(request)) {
    return Response.json({ error: "Invalid origin." }, { status: 403 })
  }
  const prefix = new URL(request.url).pathname.startsWith("/auth/api/rpc")
    ? "/auth/api/rpc"
    : "/api/rpc"
  const responseHeaders = corsHeadersForTrustedOrigin(request)
  const result = await handler.handle(request, {
    prefix,
    context: { headers: request.headers, responseHeaders },
  })
  const response = result.response ?? new Response("Not Found", { status: 404 })
  for (const cookie of responseHeaders.getSetCookie())
    response.headers.append("set-cookie", cookie)
  for (const [key, value] of corsHeadersForTrustedOrigin(request).entries()) {
    if (key.toLowerCase() === "set-cookie") continue
    response.headers.set(key, value)
  }
  response.headers.set("Cache-Control", "no-store")
  return response
}

export async function OPTIONS(request: Request) {
  const headers = corsHeadersForTrustedOrigin(request)
  if (!headers.has("Access-Control-Allow-Origin")) {
    return new Response(null, { status: 403, headers })
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "content-type, authorization")
  headers.set("Access-Control-Max-Age", "600")
  return new Response(null, { status: 204, headers })
}

export { handle as POST }
