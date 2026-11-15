import { getAuth, readSocialProviderAvailability } from "@packages/better-auth"

export async function GET(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers })
  if (!session)
    return Response.json({ error: "Sign in first." }, { status: 401 })
  return Response.json(readSocialProviderAvailability(), {
    headers: { "Cache-Control": "no-store" },
  })
}
