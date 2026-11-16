import { serverEnv } from "@packages/t3-env/server"

/** Forward the browser cookie jar to the auth billing API (avoids cross-port CORS). */
export async function proxyAuthBillingRequest(
  request: Request,
  path: string
): Promise<Response> {
  const authBase = serverEnv.BETTER_AUTH_URL.replace(/\/$/, "")
  const headers = new Headers()
  const cookie = request.headers.get("cookie")
  if (cookie) {
    headers.set("cookie", cookie)
  }
  const contentType = request.headers.get("content-type")
  if (contentType) {
    headers.set("content-type", contentType)
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
    redirect: "manual",
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer()
  }

  const response = await fetch(`${authBase}${path}`, init)
  const body = await response.arrayBuffer()
  const outbound = new Headers()
  const responseType = response.headers.get("content-type")
  if (responseType) {
    outbound.set("content-type", responseType)
  }
  outbound.set("cache-control", "no-store")
  return new Response(body, { status: response.status, headers: outbound })
}
