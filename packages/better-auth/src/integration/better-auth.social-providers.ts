import { serverEnv } from "@packages/t3-env/server"
import type { betterAuth } from "better-auth"

import { isSocialProviderConfigured } from "./better-auth.social-provider-availability"

export function buildSocialProviders(): NonNullable<
  Parameters<typeof betterAuth>[0]["socialProviders"]
> {
  const providers: NonNullable<
    Parameters<typeof betterAuth>[0]["socialProviders"]
  > = {}

  const googleClientId = serverEnv.GOOGLE_CLIENT_ID
  const googleClientSecret = serverEnv.GOOGLE_CLIENT_SECRET
  if (
    isSocialProviderConfigured("google") &&
    googleClientId &&
    googleClientSecret
  ) {
    providers.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      requireEmailVerification: true,
    }
  }

  const githubClientId = serverEnv.GITHUB_CLIENT_ID
  const githubClientSecret = serverEnv.GITHUB_CLIENT_SECRET
  if (
    isSocialProviderConfigured("github") &&
    githubClientId &&
    githubClientSecret
  ) {
    providers.github = {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      requireEmailVerification: true,
    }
  }

  return providers
}
