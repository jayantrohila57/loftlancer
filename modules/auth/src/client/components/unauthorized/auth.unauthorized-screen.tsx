"use client"

import { clientEnv } from "@packages/t3-env/client"
import { Button } from "@packages/ui/components/button"
import Shell from "@packages/ui/components/shell"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  authUnauthorizedCopyKey,
  classifyAuthUnauthorizedReason,
} from "../../../utils/auth.unauthorized-reason"
import { useAuthLocale } from "../../hooks/auth.locale.client"

export function AuthUnauthorizedScreen() {
  const t = useTranslations("ui")
  const locale = useAuthLocale()
  const reason = useSearchParams().get("reason")
  const kind = classifyAuthUnauthorizedReason(reason)
  const copy = authUnauthorizedCopyKey[kind]
  const authApp = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
  const accountURL = `${authApp}/${locale}/account`

  return (
    <Shell.Section variant="center">
      <Shell.Stack variant="form">
        <div className="space-y-1 text-center" role="status">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t(copy.title)}
          </h1>
          <p className="text-sm text-muted-foreground">{t(copy.description)}</p>
        </div>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Button
            render={<a href={accountURL}>{t("goToAccount")}</a>}
            type="button"
          />
          <Button
            onClick={() => window.history.back()}
            type="button"
            variant="outline"
          >
            {t("goBack")}
          </Button>
        </div>
      </Shell.Stack>
    </Shell.Section>
  )
}
