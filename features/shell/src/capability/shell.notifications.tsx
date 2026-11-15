"use client"

import { Button } from "@packages/ui/components/button"
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@packages/ui/components/tooltip"
import { Bell } from "lucide-react"
import { useTranslations } from "next-intl"

export function ShellNotifications() {
  const t = useTranslations("ui")

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button aria-label={t("notifications")} size="icon" variant="ghost" />
        }
      >
        <Bell aria-hidden="true" />
      </TooltipTrigger>
      <TooltipPopup>{t("notifications")}</TooltipPopup>
    </Tooltip>
  )
}
