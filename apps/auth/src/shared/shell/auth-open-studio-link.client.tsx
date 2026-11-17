"use client"

import { clientEnv } from "@packages/t3-env/client"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@packages/ui/components/sidebar"
import { ExternalLink } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

function resolveStudioHref(locale: string): string {
  const studioBase =
    clientEnv.NEXT_PUBLIC_STUDIO_APP_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/studio`
      : "http://localhost:3003")
  return `${studioBase}/${locale}`
}

export function AuthOpenStudioLink() {
  const t = useTranslations("ui")
  const locale = useLocale()
  const href = resolveStudioHref(locale)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<a href={href} rel="noopener noreferrer" target="_blank" />}
          tooltip={t("openStudio")}
        >
          <ExternalLink aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{t("openStudio")}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
