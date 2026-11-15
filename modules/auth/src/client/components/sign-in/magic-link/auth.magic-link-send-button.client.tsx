"use client"

import { Button } from "@packages/ui/components/button"
import { useTranslations } from "next-intl"

import { readCheckEmailAddress } from "../../../../utils/auth.check-email-address"
import { AuthMailIcon } from "../icons/auth.mail-icon.client"
import { useAuthMagicLinkSignInContext } from "./auth.magic-link-sign-in.context.client"

export function AuthMagicLinkSendButton() {
  const t = useTranslations("ui")

  const { email, pending } = useAuthMagicLinkSignInContext()
  const canSend = Boolean(readCheckEmailAddress(email))

  return (
    <Button
      className="w-full"
      disabled={!canSend}
      loading={pending}
      type="submit"
    >
      <AuthMailIcon className="size-4" />
      {t("emailMeALink")}
    </Button>
  )
}
