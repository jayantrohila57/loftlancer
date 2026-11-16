import { cn } from "@packages/ui/lib/utils"
import { Link } from "@/shared/i18n/web.i18n"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import type { WebStatusLevel } from "@/shared/status/web-better-stack-status"
import {
  getWebPlatformStatus,
  WEB_STATUS_LEVELS,
} from "@/shared/status/web-better-stack-status"
import type { LangLayoutProps } from "@/shared/types/web.app.types"

const STATUS_LABEL_KEYS = {
  operational: "statusOperational",
  degraded: "statusDegraded",
  outage: "statusOutage",
  unknown: "statusUnknown",
} as const satisfies Record<WebStatusLevel, string>

const STATUS_DOT_CLASS_NAME = {
  operational: "bg-success",
  degraded: "bg-warning",
  outage: "bg-destructive",
  unknown: "bg-muted-foreground/50",
} as const satisfies Record<WebStatusLevel, string>

const statusLinkClassName =
  "inline-flex h-8 shrink-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-sidebar-foreground"

interface WebSiteFooterStatusInput {
  readonly params: LangLayoutProps["params"]
}

export async function WebSiteFooterStatus({
  params,
}: WebSiteFooterStatusInput) {
  const t = await getServerTranslations(params, "siteShell")
  const status = await getWebPlatformStatus()
  const label = t(STATUS_LABEL_KEYS[status.level])

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "size-2 shrink-0 rounded-full",
          STATUS_DOT_CLASS_NAME[status.level]
        )}
      />
      <span className="relative inline-grid justify-items-start">
        {WEB_STATUS_LEVELS.map((level) => (
          <span
            aria-hidden="true"
            className="invisible col-start-1 row-start-1 whitespace-nowrap"
            key={level}
          >
            {t(STATUS_LABEL_KEYS[level])}
          </span>
        ))}
        <span className="col-start-1 row-start-1 whitespace-nowrap">
          {label}
        </span>
      </span>
    </>
  )

  if (!status.href) {
    return <span className={statusLinkClassName}>{content}</span>
  }

  const isInternal =
    status.href.startsWith("/") || status.href.includes("loftlancer.com/status")

  if (isInternal) {
    return (
      <Link
        aria-label={`${label}, ${t("statusPage")}`}
        className={statusLinkClassName}
        href="/status"
      >
        {content}
      </Link>
    )
  }

  return (
    <a
      aria-label={`${label}, ${t("statusPage")}`}
      className={statusLinkClassName}
      href={status.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {content}
    </a>
  )
}
