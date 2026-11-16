"use client"

import { ModeToggle } from "@features/theme"
import { cn } from "@packages/ui/lib/utils"
import { Link, usePathname } from "@/shared/i18n/web.i18n"
import {
  WEB_STATUS_TIMEZONE_OPTIONS,
  WebStatusTimezoneSelect,
} from "@/shared/status/web-status-timezone.client"

type WebStatusToolbarInput = {
  readonly overviewLabel: string
  readonly historyLabel: string
}

export function WebStatusToolbar({
  overviewLabel,
  historyLabel,
}: WebStatusToolbarInput) {
  const pathname = usePathname() ?? ""
  const onHistory = pathname.includes("/status/history")

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Status" className="flex flex-wrap items-center gap-2">
        <Link
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            onHistory
              ? "text-muted-foreground hover:text-foreground"
              : "bg-muted text-foreground"
          )}
          href="/status"
        >
          {overviewLabel}
        </Link>
        <Link
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            onHistory
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          href="/status/history"
        >
          {historyLabel}
        </Link>
      </nav>
      <div className="flex flex-wrap items-center gap-2">
        <ModeToggle />
        <WebStatusTimezoneSelect options={WEB_STATUS_TIMEZONE_OPTIONS} />
      </div>
    </div>
  )
}
