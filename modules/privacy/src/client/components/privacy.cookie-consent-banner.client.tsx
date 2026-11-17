"use client"

import { brandLinks } from "@packages/brand"
import { Button } from "@packages/ui/components/button"
import { useLocale, useTranslations } from "next-intl"

import { useCookieAnalyticsConsentBanner } from "../hooks/privacy.cookie-analytics-consent.hook"

export function PrivacyCookieConsentBanner() {
  const t = useTranslations("cookieConsent")
  const locale = useLocale()
  const { accept, reject, showBanner } = useCookieAnalyticsConsentBanner()

  if (!showBanner) return null

  const cookiesHref = `${brandLinks.website}/${locale}/legal/cookies`

  return (
    <aside
      aria-label={t("bannerLabel")}
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="dialog"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-pretty text-muted-foreground">
          {t.rich("message", {
            cookiesLink: (chunks) => (
              <a
                className="font-medium text-foreground underline underline-offset-4"
                href={cookiesHref}
                rel="noopener noreferrer"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button onClick={reject} size="sm" type="button" variant="outline">
            {t("reject")}
          </Button>
          <Button onClick={accept} size="sm" type="button">
            {t("accept")}
          </Button>
        </div>
      </div>
    </aside>
  )
}
