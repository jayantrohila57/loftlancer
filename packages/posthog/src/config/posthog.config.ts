import { clientEnv } from "@packages/t3-env/client"

import { POSTHOG_DEFAULT_HOST } from "../constants/posthog.constants"

export function resolvePostHogKey(): string {
  return clientEnv.NEXT_PUBLIC_POSTHOG_KEY?.trim() ?? ""
}

export function resolvePostHogHost(): string {
  const host =
    clientEnv.NEXT_PUBLIC_POSTHOG_HOST?.trim() || POSTHOG_DEFAULT_HOST
  return host.replace(/\/$/, "")
}

/** False when the project key is unset (build-time gate). */
export function posthogEnabled(): boolean {
  return resolvePostHogKey().length > 0
}
