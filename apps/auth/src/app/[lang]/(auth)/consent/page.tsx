import {
  McpAuthorizationConsentInvalidScreen,
  McpAuthorizationConsentScreen,
} from "@modules/mcp-authorization"
import {
  resolveOAuthConsentGrantScopes,
  verifyOAuthConsentSearchParams,
} from "@packages/better-auth"

import { requireAccountSession } from "@/shared/auth/auth.session"
import type { LangPageProps } from "@/shared/types/auth.app.types"

type ConsentPageProps = LangPageProps & {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ConsentPage({
  params,
  searchParams,
}: ConsentPageProps) {
  await requireAccountSession(params)
  const query = await searchParams
  const urlSearchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      urlSearchParams.set(key, value)
    }
  }

  const verified = await verifyOAuthConsentSearchParams(urlSearchParams)
  if (!verified) {
    return <McpAuthorizationConsentInvalidScreen />
  }

  const scopes = resolveOAuthConsentGrantScopes(verified.scope)

  return (
    <McpAuthorizationConsentScreen
      consent={{
        clientId: verified.clientId,
        scope: verified.scope,
        scopes,
        code: verified.code,
        claims: verified.claims,
      }}
    />
  )
}
