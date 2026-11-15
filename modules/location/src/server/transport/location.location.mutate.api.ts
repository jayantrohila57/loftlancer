import {
  getCompatibilitySession,
  invalidOrigin,
  unauthorized,
  validOrigin,
} from "@modules/security/server/shared/security.compatibility"
import { updateAccountLocationPreferenceResponse } from "./location.location.preference.api"
import { saveAccountLocationResponse } from "./location.location.save.api"
export async function mutateAccountLocationResponse(request: Request) {
  if (!validOrigin(request)) return invalidOrigin()
  const auth = await getCompatibilitySession(request)
  if (!auth) return unauthorized()
  let input: unknown
  try {
    input = await request.json()
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 })
  }
  if (new URL(request.url).searchParams.get("action") === "preference")
    return updateAccountLocationPreferenceResponse(auth.user.id, input)
  return saveAccountLocationResponse(auth.user.id, auth.session.id, input)
}
