import "@/shared/auth/auth.bootstrap"

import { securityRouter } from "@modules/security/server"
import { RPCHandler } from "@packages/orpc/server"

const handler = new RPCHandler({ security: securityRouter })

async function handle(request: Request) {
  if (
    request.method !== "GET" &&
    request.headers.get("origin") !== new URL(request.url).origin
  ) {
    return Response.json({ error: "Invalid origin." }, { status: 403 })
  }
  const prefix = new URL(request.url).pathname.startsWith("/auth/api/rpc")
    ? "/auth/api/rpc"
    : "/api/rpc"
  const responseHeaders = new Headers()
  const result = await handler.handle(request, {
    prefix,
    context: { headers: request.headers, responseHeaders },
  })
  const response = result.response ?? new Response("Not Found", { status: 404 })
  for (const cookie of responseHeaders.getSetCookie())
    response.headers.append("set-cookie", cookie)
  response.headers.set("Cache-Control", "no-store")
  return response
}

export { handle as POST }
