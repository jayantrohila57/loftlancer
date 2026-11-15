import "server-only"

import { getPostSignInDestination } from "@/shared/auth/auth.destination"

export function resolvePostSignInDestination(input: {
  readonly lang: string
  readonly returnTo?: string
}): string {
  return getPostSignInDestination(input.lang, input.returnTo)
}
