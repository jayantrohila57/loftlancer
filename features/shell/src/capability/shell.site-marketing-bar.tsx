import Shell from "@packages/ui/components/shell"
import type { ReactNode } from "react"

export interface SiteMarketingBarProps {
  readonly brand: ReactNode
  readonly leading?: ReactNode
  readonly trailing?: ReactNode
}

/** Marketing `Shell.Bar` row — brand (required), optional nav band, optional actions. */
export function SiteMarketingBar({
  brand,
  leading,
  trailing,
}: SiteMarketingBarProps) {
  return (
    <Shell.Bar variant="site">
      <div className="flex min-w-0 flex-1 items-center justify-start gap-4 px-2">
        {brand}
        {leading}
      </div>
      {trailing ? (
        <div className="flex min-w-0 items-center gap-2">{trailing}</div>
      ) : null}
    </Shell.Bar>
  )
}
