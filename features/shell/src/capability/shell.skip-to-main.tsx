"use client"

import { cn } from "@packages/ui/lib/utils"
import { useTranslations } from "next-intl"
import { SHELL_MAIN_CONTENT_ID } from "../utils/shell.a11y.constants"

export function ShellSkipToMainContent() {
  const t = useTranslations("ui")

  return (
    <a
      className={cn(
        "fixed start-4 top-4 z-100 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-md",
        "-translate-y-[200%] transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      href={`#${SHELL_MAIN_CONTENT_ID}`}
      onClick={(event) => {
        const main = document.getElementById(SHELL_MAIN_CONTENT_ID)
        if (main === null) {
          return
        }
        event.preventDefault()
        main.focus({ preventScroll: false })
        if (typeof main.scrollIntoView === "function") {
          main.scrollIntoView({ block: "start" })
        }
      }}
    >
      {t("skipToMainContent")}
    </a>
  )
}
