import { SiteMarketingBar } from "@features/shell"
import { brand } from "@packages/brand"
import { ShipCargo } from "lucide-react"
import { Link } from "@/shared/i18n/studio.i18n"
import { StudioOnboardingHeaderActions } from "@/shared/shell/studio-onboarding-header-actions"

export function StudioOnboardingHeader() {
  return (
    <SiteMarketingBar
      brand={
        <Link
          className="inline-flex shrink-0 items-center gap-2 font-medium text-sidebar-foreground"
          href="/"
        >
          <ShipCargo aria-hidden className="size-5 shrink-0" />
          {brand.name}
        </Link>
      }
      trailing={<StudioOnboardingHeaderActions />}
    />
  )
}
