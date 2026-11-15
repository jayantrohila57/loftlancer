import {
  getCompatibilitySession,
  unauthorized,
} from "@modules/security/server/shared/security.compatibility"
import { getLocationController } from "../services/location.service.location.get"
export async function getAccountLocationResponse(request: Request) {
  const auth = await getCompatibilitySession(request)
  if (!auth) return unauthorized()
  return Response.json(
    await getLocationController(auth.user.id, auth.session.id),
    { headers: { "Cache-Control": "no-store" } }
  )
}
