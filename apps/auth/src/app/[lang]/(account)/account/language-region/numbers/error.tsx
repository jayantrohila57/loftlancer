"use client"

import { AuthAccountRegionalFormRouteError } from "@modules/regional-preferences"

export default function AuthAccountLanguageRegionNumbersError({
  reset,
}: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  return <AuthAccountRegionalFormRouteError reset={reset} section="numbers" />
}
