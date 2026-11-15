"use client"

import { AuthAccountAppearanceFormRouteError } from "@modules/appearance-preferences"

export default function AuthAccountAppearanceThemeError({
  reset,
}: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  return <AuthAccountAppearanceFormRouteError reset={reset} section="theme" />
}
