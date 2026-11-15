"use client"

import { SidebarTrigger } from "@packages/ui/components/sidebar"
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@packages/ui/components/tooltip"
import { useTranslations } from "next-intl"

export function ShellSidebarToggle() {
  const t = useTranslations("ui")

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<SidebarTrigger className="size-8" />} />
        <TooltipPopup>{t("toggleSidebar")}</TooltipPopup>
      </Tooltip>
    </TooltipProvider>
  )
}
