import { getAuth } from "@packages/better-auth"

export function validOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin
}
export function invalidOrigin() {
  return Response.json({ error: "Invalid origin." }, { status: 403 })
}
export function unauthorized() {
  return Response.json({ error: "Sign in first." }, { status: 401 })
}
export function getCompatibilitySession(request: Request) {
  return getAuth().api.getSession({ headers: request.headers })
}
