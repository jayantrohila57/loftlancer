"use client"

import { clientEnv } from "@packages/t3-env/client"
import { useSearchParams } from "next/navigation"

import { useAuthLocale } from "./auth.locale.client"

export interface AuthWelcomePaths {
  readonly continueURL: string
  readonly welcomeURL: string
  readonly firstLoginURL: string
  readonly accountURL: string
  readonly accountOverviewURL: string
  readonly profileURL: string
  readonly securityURL: string
  readonly organizationsListURL: string
}

export function useAuthWelcomePaths(): AuthWelcomePaths {
  const locale = useAuthLocale()
  const authApp = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
  const returnTo = useSearchParams().get("returnTo")
  const query = returnTo ? `?${new URLSearchParams({ returnTo })}` : ""
  const localeBase = `${authApp}/${locale}`

  return {
    continueURL: `${localeBase}/continue${query}`,
    welcomeURL: `${localeBase}/welcome${query}`,
    firstLoginURL: `${localeBase}/first-login${query}`,
    accountURL: `${localeBase}/account`,
    accountOverviewURL: `${localeBase}/account/overview`,
    profileURL: `${localeBase}/account/profile`,
    securityURL: `${localeBase}/account/security`,
    organizationsListURL: `${localeBase}/organizations/list`,
  }
}
