"use client"

import { Button } from "@packages/ui/components/button"
import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"

import { useResendVerificationEmail } from "../../hooks/profile.hook.resend-verification"

export function ProfileAccountPersonalResendVerification({
  email,
}: {
  readonly email: string
}) {
  const t = useTranslations("ui")
  const resend = useResendVerificationEmail()

  return (
    <Button
      type="button"
      variant="link"
      className="h-auto px-0 text-xs"
      disabled={resend.isPending}
      onClick={() => {
        void toastManager.promise(resend.mutateAsync(email), {
          loading: t("resendVerificationEmail"),
          success: t("verificationEmailSent"),
          error: t("verificationEmailFailed"),
        })
      }}
    >
      {resend.isPending ? t("loading") : t("resendVerificationEmail")}
    </Button>
  )
}
