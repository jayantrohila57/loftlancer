import { cn } from "@packages/ui/lib/utils"
import type { WebStatusLevel } from "@/shared/status/web-better-stack-status"

const BANNER_CLASS: Record<WebStatusLevel, string> = {
  operational: "border-success/40 bg-success/10 text-success",
  degraded: "border-warning/40 bg-warning/10 text-warning-foreground",
  outage: "border-destructive/40 bg-destructive/10 text-destructive",
  unknown: "border-border bg-muted text-muted-foreground",
}

type WebStatusBannerInput = {
  readonly level: WebStatusLevel
  readonly title: string
  readonly description: string
}

export function WebStatusBanner({
  level,
  title,
  description,
}: WebStatusBannerInput) {
  return (
    <div className={cn("rounded-lg border px-4 py-3", BANNER_CLASS[level])}>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-pretty opacity-90">{description}</p>
    </div>
  )
}
