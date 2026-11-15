"use client"

import { Button } from "@packages/ui/components/button"
import { useTranslations } from "next-intl"

import { useAuthCheckEmailContext } from "./auth.check-email.context.client"

export function AuthCheckEmailResendButton() {
  const t = useTranslations("ui")
  const { canResend, pending, onResend } = useAuthCheckEmailContext()

  return (
    <Button
      className="w-full"
      disabled={!canResend}
      loading={pending}
      onClick={() => {
        void onResend()
      }}
      type="button"
      variant="outline"
    >
      {t("resendMagicLink")}
    </Button>
  )
}
