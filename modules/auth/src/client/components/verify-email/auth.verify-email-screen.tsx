"use client"

import { clientEnv } from "@packages/t3-env/client"
import { Button } from "@packages/ui/components/button"
import Shell from "@packages/ui/components/shell"
import { useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import type { AuthOAuthCallbackFailureKind } from "../../../utils/auth.oauth-callback-error"
import { classifyAuthOAuthCallbackError } from "../../../utils/auth.oauth-callback-error"

function resolveVerifyState(
  error: string | null
): AuthOAuthCallbackFailureKind | "success" {
  if (!error) return "success"
  const kind = classifyAuthOAuthCallbackError(error)
  return kind === "expired"
    ? "expired"
    : kind === "provider"
      ? "provider"
      : kind
}

export function AuthVerifyEmailScreen() {
  const t = useTranslations("ui")
  const locale = useLocale()
  const searchParams = useSearchParams()
  const state = useMemo(
    () => resolveVerifyState(searchParams.get("error")),
    [searchParams]
  )
  const profileHref = `${clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")}/${locale}/account/profile`

  const title =
    state === "success"
      ? t("verifyEmailSuccessTitle")
      : state === "expired"
        ? t("verifyEmailExpiredTitle")
        : t("verifyEmailFailedTitle")

  const description =
    state === "success"
      ? t("verifyEmailSuccessDescription")
      : state === "expired"
        ? t("verifyEmailExpiredDescription")
        : t("verifyEmailFailedDescription")

  return (
    <Shell.Section variant="center">
      <Shell.Stack variant="form">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={() => window.location.assign(profileHref)}
          >
            {t("backToProfile")}
          </Button>
        </div>
      </Shell.Stack>
    </Shell.Section>
  )
}
