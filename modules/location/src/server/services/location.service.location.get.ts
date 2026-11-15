import {
  getLocationPreference,
  getSessionLocation,
} from "../repositories/location.repository.router"

export async function getLocationController(userId: string, sessionId: string) {
  const [preference, location] = await Promise.all([
    getLocationPreference(userId),
    getSessionLocation(userId, sessionId),
  ])
  return {
    enabled: preference?.locationEnabled ?? false,
    decided: Boolean(preference?.locationDecisionAt),
    generation: preference?.locationGeneration ?? 0,
    location: location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracyMeters: location.accuracyMeters,
          capturedAt: location.capturedAt,
        }
      : null,
  }
}
