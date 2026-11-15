import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import type { McpAuthorizationConsentRequest } from "../../utils/types/mcp-authorization.consent.types"
import { McpAuthorizationConsentClient } from "./mcp-authorization.consent.client"

interface McpAuthorizationConsentScreenProps {
  readonly consent: McpAuthorizationConsentRequest
}

export function McpAuthorizationConsentScreen({
  consent,
}: McpAuthorizationConsentScreenProps) {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="center">
      <Shell.Stack variant="form">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("mcpConsentTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("mcpConsentSubtitle")}
          </p>
        </div>

        <McpAuthorizationConsentClient consent={consent} />
      </Shell.Stack>
    </Shell.Section>
  )
}
