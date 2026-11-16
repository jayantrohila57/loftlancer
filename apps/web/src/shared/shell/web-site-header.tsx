import { SiteMarketingBar } from "@features/shell"
import { brand } from "@packages/brand"
import { ShipCargo } from "lucide-react"
import { Link } from "@/shared/i18n/web.i18n"
import { WebSiteHeaderActions } from "@/shared/shell/web-site-header-actions"
import { WebSiteHeaderCommandTrigger } from "@/shared/shell/web-site-header-command-trigger"
import { WebSiteNav } from "@/shared/shell/web-site-nav"
import { WebSiteNavMobile } from "@/shared/shell/web-site-nav-mobile"
import type { LangLayoutProps } from "@/shared/types/web.app.types"

export async function WebSiteHeader(_props: Pick<LangLayoutProps, "params">) {
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
      leading={
        <>
          <div
            aria-hidden="true"
            className="hidden h-6 w-px shrink-0 bg-border md:block"
          />
          <WebSiteNav />
        </>
      }
      trailing={
        <>
          <WebSiteHeaderCommandTrigger />
          <div aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
          <WebSiteNavMobile />
          <WebSiteHeaderActions />
        </>
      }
    />
  )
}