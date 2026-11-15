import { setLocationPreference } from "../repositories/location.repository.router"

export async function updateLocationPreferenceController(
  userId: string,
  enabled: boolean
) {
  await setLocationPreference(userId, enabled)
  return { enabled }
}
