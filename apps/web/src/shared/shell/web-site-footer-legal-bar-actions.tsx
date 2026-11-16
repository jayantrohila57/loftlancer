"use client"

import { Skeleton } from "@packages/ui/components/skeleton"
import { lazy, Suspense, useEffect, useState } from "react"

const WebSiteFooterRssButton = lazy(() =>
  import("@/shared/shell/web-site-footer-rss-button").then((module) => ({
    default: module.WebSiteFooterRssButton,
  }))
)

function IconSkeleton() {
  return <Skeleton aria-hidden="true" className="size-9 sm:size-8" />
}

interface WebSiteFooterLegalBarActionsInput {
  readonly rssHref: string
}

export function WebSiteFooterLegalBarActions({
  rssHref,
}: WebSiteFooterLegalBarActionsInput) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Suspense fallback={<IconSkeleton />}>
      {mounted ? <WebSiteFooterRssButton href={rssHref} /> : <IconSkeleton />}
    </Suspense>
  )
}
