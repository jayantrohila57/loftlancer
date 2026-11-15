"use client"

import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import { ssoClient } from "@better-auth/sso/client"
import { clientEnv } from "@packages/t3-env/client"
import {
  adminClient,
  deviceAuthorizationClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { autumnClient } from "./autumn-js.client"

import { betterAuthAdminRoles } from "./better-auth.admin-roles"

const authAppBase = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")

/** Must match server `basePath` in `better-auth.server.ts` (`{appBase}/api/auth`). */
export const authClientBaseUrl = `${authAppBase}/api/auth`

export const authClient = createAuthClient({
  baseURL: authClientBaseUrl,
  fetchOptions: { credentials: "include" },
  plugins: [
    oauthProviderClient(),
    adminClient({ roles: betterAuthAdminRoles }),
    magicLinkClient(),
    deviceAuthorizationClient(),
    organizationClient(),
    autumnClient(),
  ],
})

type AuthClientFailure = {
  readonly code?: string
  readonly message?: string
  readonly status?: number
  readonly statusText?: string
}

export type SsoSignInResponse = {
  readonly data: { readonly redirect?: boolean; readonly url?: string } | null
  readonly error: AuthClientFailure | null
}

export async function signInWithSso(input: {
  readonly callbackURL: string
  readonly email: string
  readonly errorCallbackURL?: string
}): Promise<SsoSignInResponse> {
  const response = await createAuthClient({
    baseURL: authClientBaseUrl,
    plugins: [ssoClient()],
  }).signIn.sso(input)

  return {
    data: response.data
      ? { redirect: response.data.redirect, url: response.data.url }
      : null,
    error: response.error
      ? {
          code: response.error.code,
          message: response.error.message,
          status: response.error.status,
          statusText: response.error.statusText,
        }
      : null,
  }
}

export type OAuthConsentResponse = {
  readonly data: { readonly url?: string } | null
  readonly error: AuthClientFailure | null
}

export async function decideOAuthConsent(
  accept: boolean
): Promise<OAuthConsentResponse> {
  const response = await authClient.oauth2.consent({ accept })

  return {
    data: response.data ? { url: response.data.url } : null,
    error: response.error
      ? {
          code: response.error.code,
          message: response.error.message,
          status: response.error.status,
          statusText: response.error.statusText,
        }
      : null,
  }
}
