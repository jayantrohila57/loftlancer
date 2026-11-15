"use client"

import { useTranslations } from "next-intl"

import type { McpAuthorizationConsentRequest } from "../../utils/types/mcp-authorization.consent.types"
import { McpAuthorizationConsentActions } from "./mcp-authorization.consent-actions.client"
import { McpAuthorizationConsentScopeList } from "./mcp-authorization.consent-scope-list.client"

interface McpAuthorizationConsentClientProps {
  readonly consent: McpAuthorizationConsentRequest
}

export function McpAuthorizationConsentClient({
  consent,
}: McpAuthorizationConsentClientProps) {
  const t = useTranslations("ui")

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{t("mcpConsentIntro")}</p>
        <p className="font-mono text-sm">{consent.clientId}</p>
      </div>

      <div className="border-t pt-4">
        <h2 className="text-sm font-medium">{t("mcpConsentAccessTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("mcpConsentAccessDescription")}
        </p>
      </div>

      <McpAuthorizationConsentScopeList consent={consent} />

      <McpAuthorizationConsentActions />
    </div>
  )
}
