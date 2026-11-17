import { getAuth } from "@packages/better-auth"
import { Button } from "@packages/ui/components/button"
import { headers } from "next/headers"
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

export async function WebHelpStillNeedBlock({
  contactHref,
  copy,
  locale,
}: WebHelpStillNeedBlockProps) {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  })
  const ticketsHref = `/auth/${locale}/account/help-support/support-tickets`
  const supportHref = session?.user ? ticketsHref : contactHref
  const supportLabel = session?.user ? copy.ticketsCta : copy.contactCta

  return (
    <aside className="rounded-xl border border-border bg-muted/30 p-6">
      <h2 className="text-lg font-semibold tracking-tight">{copy.title}</h2>
      <p className="mt-2 text-sm text-pretty text-muted-foreground">
        {copy.body}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild size="sm" variant="default">
          <Link href={supportHref}>{supportLabel}</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={contactHref}>{copy.contactCta}</Link>
        </Button>
      </div>
    </aside>
  )
}