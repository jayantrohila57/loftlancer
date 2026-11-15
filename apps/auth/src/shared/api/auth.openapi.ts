import "server-only"
import "@/shared/auth/auth.bootstrap"

import { securityRouter } from "@modules/security/server"
import { getAuth } from "@packages/better-auth"
import {
  OpenAPIHandler,
  OpenAPIReferencePlugin,
  ZodToJsonSchemaConverter,
} from "@packages/orpc/server"

const handler = new OpenAPIHandler(
  { security: securityRouter },
  {
    plugins: [
      new OpenAPIReferencePlugin({
        docsPath: "/reference",
        specPath: "/openapi.json",
        docsProvider: "scalar",
        docsTitle: "Auth API reference",
        schemaConverters: [new ZodToJsonSchemaConverter()],
        specGenerateOptions: {
          info: {
            title: "Auth API",
            version: "1.0.0",
            description:
              "Authenticated account security procedures. Better Auth's own endpoints and compatibility HTTP endpoints are documented separately.",
          },
          servers: [{ url: "/auth/api" }],
          components: {
            securitySchemes: {
              betterAuthSession: {
                type: "apiKey",
                in: "cookie",
                name: "better-auth.session_token",
                description:
                  "Better Auth session cookie. HTTPS deployments may use a secure cookie prefix. Sign in to the Auth app first.",
              },
            },
          },
          security: [{ betterAuthSession: [] }],
        },
      }),
    ],
  }
)

export async function handleAuthOpenAPI(request: Request) {
  const responseHeaders = new Headers({ "Cache-Control": "no-store" })
  const url = new URL(request.url)
  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.headers.get("origin") !== url.origin
  ) {
    return Response.json(
      { error: "Invalid origin." },
      { status: 403, headers: responseHeaders }
    )
  }
  const session = await getAuth().api.getSession({
    headers: request.headers,
    returnHeaders: true,
  })
  for (const cookie of session.headers.getSetCookie())
    responseHeaders.append("Set-Cookie", cookie)
  if (!session.response)
    return Response.json(
      { error: "Sign in first." },
      { status: 401, headers: responseHeaders }
    )
  const prefix = url.pathname.startsWith("/auth/api/") ? "/auth/api" : "/api"
  const procedureHeaders = new Headers()
  const { response } = await handler.handle(request, {
    prefix,
    context: { headers: request.headers, responseHeaders: procedureHeaders },
  })
  const result = response ?? new Response("Not Found", { status: 404 })
  result.headers.set("Cache-Control", "no-store")
  for (const cookie of responseHeaders.getSetCookie())
    result.headers.append("Set-Cookie", cookie)
  for (const cookie of procedureHeaders.getSetCookie())
    result.headers.append("Set-Cookie", cookie)
  return result
}
