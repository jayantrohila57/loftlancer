import { redirect as nextRedirect } from "next/navigation"

/** Preserve absolute cross-app authentication callback destinations verbatim. */
export function redirectToExternalDestination(destination: string): never {
  const url = new URL(destination)
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "Authentication destinations must be absolute HTTP(S) URLs without credentials"
    )
  }
  return nextRedirect(destination)
}
