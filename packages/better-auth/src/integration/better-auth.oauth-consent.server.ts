import { verifyOAuthQueryParams } from "@better-auth/oauth-provider"

import { isPermittedOAuthConsentScope } from "./better-auth.oauth-consent.policy"
import { getAuth } from "./better-auth.server"

export type VerifiedOAuthConsentQuery = {
  clientId: string
  scope: string
  code: string
  claims?: string
  oauthQuery: string
}

export async function verifyOAuthConsentSearchParams(
  searchParams: URLSearchParams
): Promise<VerifiedOAuthConsentQuery | null> {
  const oauthQuery = searchParams.toString()
  if (!oauthQuery) {
    return null
  }

  const auth = getAuth()
  const { secret } = await auth.$context
  const verified = await verifyOAuthQueryParams(oauthQuery, secret)
  if (!verified) {
    return null
  }

  const clientId = searchParams.get("client_id")
  const scope = searchParams.get("scope")
  const code = searchParams.get("code")
  if (!clientId || !scope || !code) {
    return null
  }

  if (!isPermittedOAuthConsentScope(scope)) {
    return null
  }

  return {
    clientId,
    scope,
    code,
    claims: searchParams.get("claims") ?? undefined,
    oauthQuery,
  }
}
