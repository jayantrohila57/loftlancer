"use client"

import { useShellNavigation } from "@features/shell"
import { useLocale, useTranslations } from "next-intl"
import { buildAuthSignInLocation } from "../../../utils/auth.sign-in-location"

export function AuthSessionEndedNotice() {
  const t = useTranslations("ui")
  const locale = useLocale()
  const { Link } = useShellNavigation()
  const signInHref = buildAuthSignInLocation({ locale })

  return (
    <p className="text-sm text-muted-foreground">
      {t("sessionEnded")}{" "}
      <Link href={signInHref} className="underline">
        {t("signIn")}
      </Link>
    </p>
  )
}
