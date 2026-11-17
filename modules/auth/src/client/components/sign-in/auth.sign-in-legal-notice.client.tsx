"use client"

import { brandLinks } from "@packages/brand"
import { useTranslations } from "next-intl"

import { useAuthLocale } from "../../hooks/auth.locale.client"

export function AuthSignInLegalNotice() {
  const t = useTranslations("ui")
  const locale = useAuthLocale()
  const termsHref = `${brandLinks.website}/${locale}/legal/terms`
  const privacyHref = `${brandLinks.website}/${locale}/legal/privacy`

  return (
    <p className="text-center text-xs text-pretty text-muted-foreground">
      {t.rich("signInLegalConsent", {
        privacy: (chunks) => (
          <a
            className="underline underline-offset-4 hover:text-foreground"
            href={privacyHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            {chunks}
          </a>
        ),
        terms: (chunks) => (
          <a
            className="underline underline-offset-4 hover:text-foreground"
            href={termsHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            {chunks}
          </a>
        ),
      })}
    </p>
  )
}
