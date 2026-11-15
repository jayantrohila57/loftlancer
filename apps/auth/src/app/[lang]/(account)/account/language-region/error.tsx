"use client"

import { AuthAccountRegionalOverviewRouteError } from "@modules/regional-preferences"

export default function AuthAccountLanguageRegionError({
  reset,
}: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  return <AuthAccountRegionalOverviewRouteError reset={reset} />
}
