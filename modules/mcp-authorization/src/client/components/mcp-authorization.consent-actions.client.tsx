"use client"

import { Button } from "@packages/ui/components/button"
import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"

import { useMcpOAuthConsentDecision } from "../hooks/mcp-authorization.consent.hook"

export function McpAuthorizationConsentActions() {
  const t = useTranslations("ui")
  const decision = useMcpOAuthConsentDecision()

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <Button
        loading={decision.isPending}
        onClick={() => {
          toastManager
            .promise(decision.mutateAsync(false), {
              loading: t("mcpConsentDenyPending"),
              success: t("mcpConsentDenied"),
              error: (error) =>
                error instanceof Error ? error.message : t("mcpConsentFailed"),
            })
            .catch(() => undefined)
        }}
        type="button"
        variant="outline"
      >
        {t("deny")}
      </Button>
      <Button
        loading={decision.isPending}
        onClick={() => {
          toastManager
            .promise(decision.mutateAsync(true), {
              loading: t("mcpConsentApprovePending"),
              success: t("mcpConsentApproved"),
              error: (error) =>
                error instanceof Error ? error.message : t("mcpConsentFailed"),
            })
            .catch(() => undefined)
        }}
        type="button"
      >
        {t("allow")}
      </Button>
    </div>
  )
}
