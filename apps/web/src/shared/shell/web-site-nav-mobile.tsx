"use client"

import { Button } from "@packages/ui/components/button"
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@packages/ui/components/sheet"
import { cn } from "@packages/ui/lib/utils"
import { Menu } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Link, usePathname } from "@/shared/i18n/web.i18n"
import {
  getWebSiteNavItemSpecsForHeaderDropdown,
  isWebSiteNavItemActive,
  WEB_SITE_NAV_GROUP_HEADING_KEYS,
  WEB_SITE_SURFACE_NAV_GROUPS,
} from "@/shared/shell/web-site-navigation"

export function WebSiteNavMobile() {
  const t = useTranslations("siteShell")
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        aria-label={t("navMenu")}
        className="size-9 sm:size-8 md:hidden"
        onClick={() => setOpen(true)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Menu aria-hidden="true" />
      </Button>
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetPopup
          className="w-[min(100%-3rem,18rem)] bg-sidebar p-0 text-sidebar-foreground"
          side="left"
        >
          <SheetHeader className="border-b border-border">
            <SheetTitle>{t("navMenu")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t("navPrimary")}
            </SheetDescription>
          </SheetHeader>
          <SheetPanel scrollFade={false}>
            <div className="flex flex-col gap-6 py-2">
              {WEB_SITE_SURFACE_NAV_GROUPS.map((group) => {
                const items = getWebSiteNavItemSpecsForHeaderDropdown(group)

                return (
                  <nav
                    key={group}
                    aria-label={t(WEB_SITE_NAV_GROUP_HEADING_KEYS[group])}
                    className="px-2"
                  >
                    <h2 className="mb-2 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {t(WEB_SITE_NAV_GROUP_HEADING_KEYS[group])}
                    </h2>
                    <ul className="flex flex-col gap-1">
                      {items.map((item) => {
                        const active = isWebSiteNavItemActive(
                          pathname,
                          item.href
                        )

                        return (
                          <li key={item.id}>
                            <Link
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "block rounded-lg px-3 py-2 text-sm transition-colors",
                                active
                                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )}
                              href={item.href}
                              onClick={() => setOpen(false)}
                            >
                              {t(item.labelKey)}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </nav>
                )
              })}
            </div>
          </SheetPanel>
        </SheetPopup>
      </Sheet>
    </>
  )
}
