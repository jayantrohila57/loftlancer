"use client"

import { stripLeadingLocaleFromPathname } from "@features/i18n/pathname"
import { Button } from "@packages/ui/components/button"
import { CircleAlert, FileQuestion } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/shared/i18n/auth.i18n"

type AuthRouteBoundaryPanelProps = {
  readonly onRetry?: () => void
  readonly showSectionHome?: boolean
  readonly variant: "error" | "not-found"
}

function resolveAccountSectionHome(pathname: string): string | undefined {
  const segments = stripLeadingLocaleFromPathname(pathname)
    .split("/")
    .filter(Boolean)
  const accountIndex = segments.indexOf("account")
  if (accountIndex === -1) {
    return undefined
  }

  const sectionSlug = segments[accountIndex + 1]
  const pageSegments = segments.slice(accountIndex + 2)
  if (!sectionSlug || pageSegments.length === 0) {
    return undefined
  }

  return `/account/${sectionSlug}`
}

export function AuthRouteBoundaryPanel({
  onRetry,
  showSectionHome = false,
  variant,
}: AuthRouteBoundaryPanelProps) {
  const t = useTranslations("routeBoundaries")
  const tUi = useTranslations("ui")
  const pathname = usePathname()

  const title = variant === "error" ? t("errorTitle") : t("notFoundTitle")
  const description =
    variant === "error" ? t("errorDescription") : t("notFoundDescription")
  const Icon = variant === "error" ? CircleAlert : FileQuestion
  const sectionHome =
    showSectionHome && variant === "not-found"
      ? resolveAccountSectionHome(pathname)
      : undefined

  return (
    <div
      className="flex min-h-[12rem] flex-col items-start justify-center gap-3 rounded-lg border border-border bg-muted/20 p-4"
      role={variant === "error" ? "alert" : "status"}
    >
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden
          className="mt-0.5 size-5 shrink-0 text-muted-foreground"
        />
        <div className="space-y-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onRetry ? (
          <Button onClick={onRetry} size="sm" type="button">
            {tUi("tryAgain")}
          </Button>
        ) : null}
        <Button
          onClick={() => window.history.back()}
          size="sm"
          type="button"
          variant="outline"
        >
          {tUi("goBack")}
        </Button>
        {sectionHome ? (
          <Button
            render={<Link href={sectionHome} />}
            size="sm"
            variant="outline"
          >
            {t("backToSection")}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
