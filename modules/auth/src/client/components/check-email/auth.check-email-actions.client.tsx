"use client"

import { useTranslations } from "next-intl"

import { useAuthCheckEmailContext } from "./auth.check-email.context.client"

export function AuthCheckEmailActions() {
  const t = useTranslations("ui")
  const { signInURL } = useAuthCheckEmailContext()

  return (
    <p className="text-center text-sm">
      <a
        className="text-primary underline-offset-4 hover:underline"
        href={signInURL}
      >
        {t("changeEmail")}
      </a>
    </p>
  )
}
