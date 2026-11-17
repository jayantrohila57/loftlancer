"use client"

import { serviceResponseFailureMessage } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import { authClient } from "@packages/better-auth/client"
import { brandLinks } from "@packages/brand"
import Shell from "@packages/ui/components/shell"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export function AuthPrivacyLegalAcceptanceView() {
  const t = useTranslations("privacyLegalAcceptance")
  const format = useFormatter()
  const locale = useLocale()
  const { data: session, isPending } = authClient.useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [record, setRecord] = useState<{
    readonly termsVersion: string
    readonly acceptedAt: string
  } | null>(null)

  useEffect(() => {
    if (isPending || !session?.user) return
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await securityRpc.security.privacy.legalAcceptance.get(
          {}
        )
        if (response.status !== "success") {
          throw new Error(
            serviceResponseFailureMessage(response, {
              invalid: t("invalid"),
              fallback: t("loadError"),
            })
          )
        }
        if (!cancelled) setRecord(response.data ?? null)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("loadError"))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isPending, session?.user, t])

  const termsHref = `${brandLinks.website}/${locale}/legal/terms`
  const privacyHref = `${brandLinks.website}/${locale}/legal/privacy`
  const cookiesHref = `${brandLinks.website}/${locale}/legal/cookies`

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.privacy-data.legal-acceptance"
          description={t("pageDescription")}
          title={t("pageTitle")}
        >
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">{t("publicLegalHint")}</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <a
                  className="underline"
                  href={termsHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t("termsLink")}
                </a>
              </li>
              <li>
                <a
                  className="underline"
                  href={privacyHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t("privacyLink")}
                </a>
              </li>
              <li>
                <a
                  className="underline"
                  href={cookiesHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t("cookiesLink")}
                </a>
              </li>
            </ul>
            {isPending || loading ? (
              <Skeleton className="h-16 w-full" />
            ) : error ? (
              <p className="text-destructive">{error}</p>
            ) : record ? (
              <dl className="grid gap-2 rounded-lg border p-4">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("termsVersion")}
                  </dt>
                  <dd className="font-medium">{record.termsVersion}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("acceptedAt")}
                  </dt>
                  <dd className="font-medium">
                    {format.dateTime(new Date(record.acceptedAt), "dateTime")}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-muted-foreground">{t("noRecord")}</p>
            )}
          </div>
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
