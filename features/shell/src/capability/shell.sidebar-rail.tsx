"use client"

import { Button } from "@packages/ui/components/button"
import { useSidebar } from "@packages/ui/components/sidebar"
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@packages/ui/components/tooltip"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"

export function ShellSidebarRail() {
  const t = useTranslations("ui")

  const { state, toggleSidebar } = useSidebar()
  const Icon = state === "collapsed" ? ChevronRight : ChevronLeft
  const label =
    state === "collapsed" ? t("expandSidebar") : t("collapseSidebar")

  return (
    <div className="group/rail absolute inset-y-0 z-20 hidden w-7 -translate-x-1/2 items-center justify-center group-data-[side=left]:-right-5.5 group-data-[side=right]:left-0 sm:flex rtl:translate-x-1/2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label={label}
              className="-mr-2.5 size-6 border bg-sidebar opacity-0 shadow-sm transition-opacity group-hover/rail:opacity-100 hover:bg-sidebar focus-visible:opacity-100"
              onClick={toggleSidebar}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          <Icon aria-hidden="true" className="size-3.5 rtl:rotate-180" />
        </TooltipTrigger>
        <TooltipPopup side="right">{label}</TooltipPopup>
      </Tooltip>
    </div>
  )
}
