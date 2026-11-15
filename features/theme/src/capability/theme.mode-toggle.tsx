"use client"

import { Button } from "@packages/ui/components/button"
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@packages/ui/components/menu"
import { Skeleton } from "@packages/ui/components/skeleton"
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@packages/ui/components/tooltip"
import { useTheme } from "@teispace/next-themes"
import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export function ModeToggle() {
  const t = useTranslations("ui")

  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Skeleton aria-hidden="true" className="size-9 sm:size-8" />
  }

  return (
    <Menu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <MenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("selectTheme")}
                  />
                }
              />
            }
          >
            <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </TooltipTrigger>
          <TooltipPopup>{t("selectTheme")}</TooltipPopup>
        </Tooltip>
      </TooltipProvider>
      <MenuPopup align="end">
        <MenuRadioGroup
          value={theme}
          onValueChange={(value: string) => setTheme(value)}
        >
          <MenuRadioItem value="light">{t("light")}</MenuRadioItem>
          <MenuRadioItem value="dark">{t("dark")}</MenuRadioItem>
          <MenuRadioItem value="system">{t("system")}</MenuRadioItem>
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  )
}
