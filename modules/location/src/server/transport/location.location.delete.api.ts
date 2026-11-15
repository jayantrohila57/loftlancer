import {
  getCompatibilitySession,
  invalidOrigin,
  unauthorized,
  validOrigin,
} from "@modules/security/server/shared/security.compatibility"
import { deleteLocationHistoryController } from "../services/location.service.location.delete"
export async function deleteAccountLocationHistoryResponse(request: Request) {
  if (!validOrigin(request)) return invalidOrigin()
  const auth = await getCompatibilitySession(request)
  if (!auth) return unauthorized()
  try {
    return Response.json(await deleteLocationHistoryController(auth.user.id))
  } catch {
    return Response.json(
      { error: "Could not delete location history." },
      { status: 503 }
    )
  }
}
