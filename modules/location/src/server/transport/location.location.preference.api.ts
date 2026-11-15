import { updateLocationPreferenceSchema } from "../../utils/validation/location.location.preference.schema"
import { updateLocationPreferenceController } from "../services/location.service.location.preference"
export async function updateAccountLocationPreferenceResponse(
  userId: string,
  input: unknown
) {
  const value = updateLocationPreferenceSchema.safeParse(input)
  if (!value.success)
    return Response.json({ error: "Invalid preference." }, { status: 400 })
  return Response.json(
    await updateLocationPreferenceController(userId, value.data.enabled)
  )
}
