"use client"

import { clientEnv } from "@packages/t3-env/client"
import { useSearchParams } from "next/navigation"
import { useAuthLocale } from "../../../hooks/auth.locale.client"

export interface AuthSignInPaths {
  readonly callbackURL: string
  readonly newUserCallbackURL: string
  readonly errorCallbackURL: string
  readonly signInURL: string
  readonly checkEmailURL: (email: string) => string
}

export function useAuthSignInPaths(): AuthSignInPaths {
  const locale = useAuthLocale()
  const authApp = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
  const returnTo = useSearchParams().get("returnTo")
  const query = returnTo ? `?${new URLSearchParams({ returnTo })}` : ""

  const signInURL = `${authApp}/${locale}/sign-in${query}`

  const newUserParams = new URLSearchParams()
  if (returnTo) newUserParams.set("returnTo", returnTo)
  newUserParams.set("newUser", "1")
  const newUserQuery = `?${newUserParams.toString()}`

  return {
    callbackURL: `${authApp}/${locale}/continue${query}`,
    newUserCallbackURL: `${authApp}/${locale}/continue${newUserQuery}`,
    errorCallbackURL: signInURL,
    signInURL,
    checkEmailURL: (email: string) =>
      `${authApp}/${locale}/check-email?email=${encodeURIComponent(email)}`,
  }
}
