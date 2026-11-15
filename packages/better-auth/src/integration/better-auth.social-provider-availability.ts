import { serverEnv } from "@packages/t3-env/server"

export type SocialProviderId = "github" | "google"

export type SocialProviderAvailability = Record<SocialProviderId, boolean>

export function readSocialProviderAvailability(): SocialProviderAvailability {
  return {
    github: Boolean(
      serverEnv.GITHUB_CLIENT_ID && serverEnv.GITHUB_CLIENT_SECRET
    ),
    google: Boolean(
      serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET
    ),
  }
}

export function isSocialProviderConfigured(
  provider: SocialProviderId
): boolean {
  return readSocialProviderAvailability()[provider]
}
