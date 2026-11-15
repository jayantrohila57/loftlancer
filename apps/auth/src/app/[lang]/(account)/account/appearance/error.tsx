"use client"

import { AuthAccountAppearanceOverviewRouteError } from "@modules/appearance-preferences"

export default function AuthAccountAppearanceError({
  reset,
}: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  return <AuthAccountAppearanceOverviewRouteError reset={reset} />
}
