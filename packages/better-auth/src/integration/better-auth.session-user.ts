import { getAuth } from "./better-auth.server"

export async function getSessionUserIdFromRequest(
  request: Request
): Promise<string | null> {
  const session = await getAuth().api.getSession({ headers: request.headers })
  return session?.user.id ?? null
}
