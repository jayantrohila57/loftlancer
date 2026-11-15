import { getAuth, getTrustedAuthOrigins } from "@packages/better-auth"
import { appearancePreferencesService } from "./services/appearance-preferences.service"

export async function readAppearancePreferencesHttp(request: Request) {
  const origin = request.headers.get("origin")
  const headers = new Headers({ "Cache-Control": "no-store", Vary: "Origin" })
  if (origin) {
    if (!getTrustedAuthOrigins().includes(origin)) {
      return Response.json(
        { error: "Invalid origin." },
        { status: 403, headers }
      )
    }
    headers.set("Access-Control-Allow-Origin", origin)
    headers.set("Access-Control-Allow-Credentials", "true")
  }
  const session = await getAuth().api.getSession({ headers: request.headers })
  if (!session)
    return Response.json({ error: "Sign in first." }, { status: 401, headers })
  const result = await appearancePreferencesService.get(session.user.id)
  return Response.json(result, {
    status: result.status === "success" ? 200 : 503,
    headers,
  })
}
