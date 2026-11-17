"use client"

import { authClient } from "@packages/better-auth/client"
import { buttonVariants } from "@packages/ui/components/button"
import { cn } from "@packages/ui/lib/utils"
import { useEffect, useState } from "react"
import { Link } from "@/shared/i18n/web.i18n"

export interface WebHelpStillNeedBlockCopy {
  readonly body: string
  readonly contactCta: string
  readonly ticketsCta: string
  readonly title: string
}

export interface WebHelpStillNeedBlockProps {
  readonly contactHref: string
  readonly copy: WebHelpStillNeedBlockCopy
  readonly locale: string
}

export function WebHelpStillNeedBlock({
  contactHref,
  copy,
  locale,
}: WebHelpStillNeedBlockProps) {
  const [mounted, setMounted] = useState(false)
  const { data, isPending } = authClient.useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  const ticketsHref = `/auth/${locale}/account/help-support/support-tickets`
  const signedIn = mounted && !isPending && Boolean(data?.user)
  const supportHref = signedIn ? ticketsHref : contactHref
  const supportLabel = signedIn ? copy.ticketsCta : copy.contactCta

  return (
    <aside className="rounded-xl border border-border bg-muted/30 p-6">
      <h2 className="text-lg font-semibold tracking-tight">{copy.title}</h2>
      <p className="mt-2 text-sm text-pretty text-muted-foreground">
        {copy.body}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          className={cn(buttonVariants({ size: "sm", variant: "default" }))}
          href={supportHref}
        >
          {supportLabel}
        </Link>
        <Link
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          href={contactHref}
        >
          {copy.contactCta}
        </Link>
      </div>
    </aside>
  )
}
