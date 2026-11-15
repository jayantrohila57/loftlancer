"use client"

import { AuthAccountAppearanceFormRouteError } from "@modules/appearance-preferences"

export default function AuthAccountAppearanceDensityError({
  reset,
}: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  return <AuthAccountAppearanceFormRouteError reset={reset} section="density" />
}
