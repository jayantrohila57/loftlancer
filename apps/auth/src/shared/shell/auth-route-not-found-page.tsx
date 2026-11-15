import { AuthRouteBoundary } from "./auth-route-boundary.client"

export function AuthRootRouteNotFound() {
  return <AuthRouteBoundary surface="root" variant="not-found" />
}

export function AuthPortalRouteNotFound() {
  return <AuthRouteBoundary surface="portal" variant="not-found" />
}

export function AuthAccountRouteNotFound() {
  return (
    <AuthRouteBoundary
      chromeTier="account"
      surface="chrome"
      variant="not-found"
    />
  )
}

export function AuthAccountSectionRouteNotFound() {
  return (
    <AuthRouteBoundary
      chromeTier="section"
      surface="chrome"
      variant="not-found"
    />
  )
}
