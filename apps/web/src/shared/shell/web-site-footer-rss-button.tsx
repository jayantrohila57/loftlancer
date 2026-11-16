"use client"

import { Button } from "@packages/ui/components/button"
import { Rss } from "lucide-react"
import { useTranslations } from "next-intl"

interface WebSiteFooterRssButtonInput {
  readonly href: string
}

export function WebSiteFooterRssButton({ href }: WebSiteFooterRssButtonInput) {
  const t = useTranslations("siteShell")

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("rssFeed")}
      render={<a href={href} rel="noopener noreferrer" target="_blank" />}
    >
      <Rss className="size-4" />
    </Button>
  )
}
