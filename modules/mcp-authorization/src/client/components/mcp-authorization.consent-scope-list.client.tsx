"use client"

import type { McpOAuthScopeConsentMessageKey } from "@packages/mcp"
import { useTranslations } from "next-intl"
import type { McpAuthorizationScope } from "../../utils/constants/mcp-authorization.scopes"
import { mcpAuthorizationScopeConsentKeys } from "../../utils/constants/mcp-authorization.scopes"
import type { McpAuthorizationConsentRequest } from "../../utils/types/mcp-authorization.consent.types"

function isMcpAuthorizationScope(
  scope: string
): scope is McpAuthorizationScope {
  return scope in mcpAuthorizationScopeConsentKeys
}

interface McpAuthorizationConsentScopeListProps {
  readonly consent: McpAuthorizationConsentRequest
}

export function McpAuthorizationConsentScopeList({
  consent,
}: McpAuthorizationConsentScopeListProps) {
  const t = useTranslations("ui")

  return (
    <ul className="space-y-2 text-sm">
      {consent.scopes.map((scope) => {
        const messageKey: McpOAuthScopeConsentMessageKey | "mcpScopeGeneric" =
          isMcpAuthorizationScope(scope)
            ? mcpAuthorizationScopeConsentKeys[scope]
            : "mcpScopeGeneric"
        return (
          <li className="rounded-md border px-3 py-2" key={scope}>
            <p className="font-medium">{scope}</p>
            <p className="text-muted-foreground">{t(messageKey)}</p>
          </li>
        )
      })}
    </ul>
  )
}
