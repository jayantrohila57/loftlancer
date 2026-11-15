"use client"

import { stripLeadingLocaleFromPathname } from "@features/i18n/pathname"
import { useShellNavigation } from "@features/shell"
import { Button } from "@packages/ui/components/button"
import { CircleAlert, FileQuestion } from "lucide-react"
import { useTranslations } from "next-intl"

type ShellAccountRouteBoundaryPanelProps = {
  readonly backToSectionLabel: string
  readonly description: string
  readonly onRetry?: () => void
  readonly showSectionHome?: boolean
  readonly title: string
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

export function ShellAccountRouteBoundaryPanel({
  backToSectionLabel,
  description,
  onRetry,
  showSectionHome = false,
  title,
}: ShellAccountRouteBoundaryPanelProps) {
  const tUi = useTranslations("ui")
  const { Link, usePathname } = useShellNavigation()
  const pathname = usePathname()

  const Icon = onRetry ? CircleAlert : FileQuestion
  const sectionHome =
    showSectionHome && !onRetry
      ? resolveAccountSectionHome(pathname)
      : undefined

  return (
    <div
      className="flex min-h-[12rem] flex-col items-start justify-center gap-3 rounded-lg border border-border bg-muted/20 p-4"
      role={onRetry ? "alert" : "status"}
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
            {backToSectionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
