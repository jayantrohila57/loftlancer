"use client"

import { authClient } from "@packages/better-auth/client"
import type { QueryClient } from "@packages/react-query"
import { useQueryClient } from "@packages/react-query"
import { useLocale } from "next-intl"
import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { clearPrivateClientBrowserStorage } from "../../utils/auth.private-client-browser-storage"
import {
  buildAuthSignInLocation,
  isAuthPublicPathname,
} from "../../utils/auth.sign-in-location"

/** Drops in-memory account data and ephemeral OAuth link state from the browser. */
export function clearPrivateClientCache(queryClient: QueryClient) {
  queryClient.clear()
  clearPrivateClientBrowserStorage()
}

export function AuthPrivateClientIdentityGuard({
  children,
}: {
  children: ReactNode
}) {
  const { data, isPending } = authClient.useSession()
  const queryClient = useQueryClient()
  const locale = useLocale()
  const previousIdentity = useRef<string | null | undefined>(undefined)
  const redirectingToSignIn = useRef(false)
  const identity = data?.user.id ?? null

  useEffect(() => {
    if (isPending) return
    const hadSignedInSession =
      previousIdentity.current !== undefined &&
      previousIdentity.current !== null
    if (
      previousIdentity.current !== undefined &&
      previousIdentity.current !== identity
    ) {
      clearPrivateClientCache(queryClient)
    }
    if (
      hadSignedInSession &&
      identity === null &&
      !redirectingToSignIn.current &&
      !isAuthPublicPathname(window.location.pathname)
    ) {
      redirectingToSignIn.current = true
      window.location.assign(buildAuthSignInLocation({ locale }))
    }
    previousIdentity.current = identity
  }, [identity, isPending, locale, queryClient])

  return children
}
