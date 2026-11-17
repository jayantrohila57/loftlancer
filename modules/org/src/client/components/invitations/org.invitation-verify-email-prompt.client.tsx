"use client"

import { runAuthMutation } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { clientEnv } from "@packages/t3-env/client"
import { Button } from "@packages/ui/components/button"
import { toastManager } from "@packages/ui/components/toast"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

export function OrgInvitationVerifyEmailPrompt() {
  const t = useTranslations("ui")
  const locale = useLocale()
  const { data: session } = authClient.useSession()
  const [pending, setPending] = useState(false)

  async function resend() {
    const email = session?.user.email?.trim()
    if (!email) return
    const authApp = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
    const callbackURL = `${authApp}/${locale}/verify-email`
    setPending(true)
    try {
      await toastManager.promise(
        runAuthMutation(
          () =>
            authClient.sendVerificationEmail({
              email,
              callbackURL,
            }),
          t("verificationEmailFailed")
        ),
        {
          loading: t("resendVerificationEmail"),
          success: t("verificationEmailSent"),
          error: t("verificationEmailFailed"),
        }
      )
    } catch {
      // Toast surfaces the failure.
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-sm font-medium">{t("invitationVerifyEmailTitle")}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("invitationVerifyEmailDescription")}
      </p>
      <Button
        type="button"
        className="mt-3"
        variant="outline"
        disabled={pending || !session?.user.email}
        onClick={() => void resend()}
      >
        {pending ? t("loading") : t("resendVerificationEmail")}
      </Button>
    </div>
  )
}
