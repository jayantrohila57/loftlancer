"use client"

import { serviceResponseFailureMessage } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { Badge } from "@packages/ui/components/badge"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

function ticketCategoryLabel(
  t: ReturnType<typeof useTranslations<"supportTickets">>,
  category: string
) {
  switch (category) {
    case "account":
      return t("category.account")
    case "billing":
      return t("category.billing")
    case "security":
      return t("category.security")
    case "technical":
      return t("category.technical")
    default:
      return t("category.other")
  }
}

function ticketStatusLabel(
  t: ReturnType<typeof useTranslations<"supportTickets">>,
  status: string
) {
  switch (status) {
    case "open":
      return t("status.open")
    case "in_progress":
      return t("status.in_progress")
    case "resolved":
      return t("status.resolved")
    case "closed":
      return t("status.closed")
    default:
      return status
  }
}

export function HelpSupportTicketDetailScreen({
  ticketId,
}: {
  readonly ticketId: string
}) {
  const t = useTranslations("supportTickets")
  const format = useFormatter()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticket, setTicket] = useState<{
    readonly id: string
    readonly category: string
    readonly subject: string
    readonly message: string
    readonly status: string
    readonly createdAt: string
    readonly updatedAt: string
  } | null>(null)

  useEffect(() => {
    if (sessionPending || !session?.user) return
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await securityRpc.security.help.supportTickets.get({
          ticketId,
        })
        if (response.status !== "success" || !response.data) {
          throw new Error(
            serviceResponseFailureMessage(response, {
              invalid: t("errors.invalid"),
              fallback: t("errors.loadOne"),
            })
          )
        }
        if (!cancelled) setTicket(response.data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("errors.loadOne"))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session?.user, sessionPending, t, ticketId])

  if (sessionPending || loading) {
    return <Skeleton className="h-40 w-full" />
  }

  if (!session?.user) {
    return (
      <p className="text-sm text-muted-foreground">{t("sessionRequired")}</p>
    )
  }

  if (error || !ticket) {
    return (
      <p className="text-sm text-destructive">{error ?? t("errors.loadOne")}</p>
    )
  }

  return (
    <article className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{ticket.subject}</h2>
          <p className="text-sm text-muted-foreground">
            {t("listMeta", {
              category: ticketCategoryLabel(t, ticket.category),
              date: format.dateTime(new Date(ticket.createdAt), "dateTime"),
            })}
          </p>
        </div>
        <Badge variant="secondary">{ticketStatusLabel(t, ticket.status)}</Badge>
      </header>
      <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
        {ticket.message}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("lastUpdated", {
          date: format.dateTime(new Date(ticket.updatedAt), "dateTime"),
        })}
      </p>
    </article>
  )
}
