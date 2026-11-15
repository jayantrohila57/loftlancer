import {
  getCompatibilitySession,
  invalidOrigin,
  unauthorized,
  validOrigin,
} from "@modules/security/server/shared/security.compatibility"
import { deleteActivityPayloadSchema } from "../../utils/validation/activity.activity.delete.schema"
import { deleteActivityController } from "../services/activity.service.activity.delete"

export async function deleteAccountActivityHistoryResponse(request: Request) {
  if (!validOrigin(request)) return invalidOrigin()
  const auth = await getCompatibilitySession(request)
  if (!auth) return unauthorized()
  const parsed = deleteActivityPayloadSchema.safeParse({
    kind: new URL(request.url).searchParams.get("kind"),
  })
  if (!parsed.success)
    return Response.json({ error: "Invalid history." }, { status: 400 })
  try {
    return Response.json(
      await deleteActivityController(auth.user.id, parsed.data.kind)
    )
  } catch {
    return Response.json(
      { error: "Could not delete activity history." },
      { status: 503 }
    )
  }
}
