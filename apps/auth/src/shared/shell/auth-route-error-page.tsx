"use client"

import { createRuntimeLogger } from "@packages/logger"
import { useEffect } from "react"
import type { AuthRouteBoundarySurface } from "./auth-route-boundary.client"
import { AuthRouteBoundary } from "./auth-route-boundary.client"

type AuthRouteErrorPageProps = {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

function AuthRouteErrorPage({
  chromeTier,
  error,
  reset,
  surface,
}: AuthRouteErrorPageProps & {
  readonly chromeTier?: "account" | "section"
  readonly surface: AuthRouteBoundarySurface
}) {
  useEffect(() => {
    createRuntimeLogger({ app: "auth", module: "route" }).error(
      "browser.route_error",
      { outcome: "error", errorDigest: error.digest }
    )
  }, [error])

  return (
    <AuthRouteBoundary
      chromeTier={chromeTier}
      onRetry={reset}
      surface={surface}
      variant="error"
    />
  )
}

export function AuthRootRouteError(props: AuthRouteErrorPageProps) {
  return <AuthRouteErrorPage {...props} surface="root" />
}

export function AuthPortalRouteError(props: AuthRouteErrorPageProps) {
  return <AuthRouteErrorPage {...props} surface="portal" />
}

export function AuthAccountRouteError(props: AuthRouteErrorPageProps) {
  return <AuthRouteErrorPage {...props} chromeTier="account" surface="chrome" />
}

export function AuthAccountSectionRouteError(props: AuthRouteErrorPageProps) {
  return <AuthRouteErrorPage {...props} chromeTier="section" surface="chrome" />
}
