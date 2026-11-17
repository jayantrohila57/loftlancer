"use client"

import { FormKit } from "@features/form"
import { useShellNavigation } from "@features/shell"
import { serviceResponseFailureMessage } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { Badge } from "@packages/ui/components/badge"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { toastManager } from "@packages/ui/components/toast"
import { useFormatter, useTranslations } from "next-intl"
import { useCallback, useEffect, useMemo, useState } from "react"
import { z } from "zod"

type TicketSummary = {
  readonly id: string
  readonly category: string
  readonly subject: string
  readonly status: string
  readonly createdAt: string
}

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

export function HelpSupportTicketsScreen() {
  const t = useTranslations("supportTickets")
  const format = useFormatter()
  const { Link } = useShellNavigation()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [tickets, setTickets] = useState<readonly TicketSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const categoryOptions = useMemo(
    () =>
      (["account", "billing", "security", "technical", "other"] as const).map(
        (value) => ({
          value,
          label: ticketCategoryLabel(t, value),
        })
      ),
    [t]
  )

  const schema = useMemo(
    () =>
      z.object({
        category: z.enum([
          "account",
          "billing",
          "security",
          "technical",
          "other",
        ]),
        subject: z.string().trim().min(3, t("validation.subjectMin")),
        message: z.string().trim().min(10, t("validation.messageMin")),
      }),
    [t]
  )

  const refreshTickets = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const response = await securityRpc.security.help.supportTickets.list({})
      if (response.status !== "success" || !response.data) {
        throw new Error(
          serviceResponseFailureMessage(response, {
            invalid: t("errors.invalid"),
            fallback: t("errors.load"),
          })
        )
      }
      setTickets(response.data)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : t("errors.load"))
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (sessionPending || !session?.user) return
    void refreshTickets()
  }, [refreshTickets, session?.user, sessionPending])

  if (sessionPending) {
    return <Skeleton className="h-32 w-full" />
  }

  if (!session?.user) {
    return (
      <p className="text-sm text-muted-foreground">{t("sessionRequired")}</p>
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-sm font-medium">{t("yourTickets")}</h3>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="flex items-start justify-between gap-3 p-3"
              >
                <div className="min-w-0 space-y-1">
                  <Link
                    className="block truncate font-medium underline"
                    href={`/account/help-support/support-tickets/${ticket.id}`}
                  >
                    {ticket.subject}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {t("listMeta", {
                      category: ticketCategoryLabel(t, ticket.category),
                      date: format.dateTime(
                        new Date(ticket.createdAt),
                        "dateTime"
                      ),
                    })}
                  </p>
                </div>
                <Badge variant="secondary">
                  {ticketStatusLabel(t, ticket.status)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <Button
          onClick={() => void refreshTickets()}
          size="sm"
          type="button"
          variant="outline"
        >
          {t("refresh")}
        </Button>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">{t("createTitle")}</h3>
        <FormKit
          defaultValues={{
            category: "account" as const,
            subject: "",
            message: "",
          }}
          onSubmit={async (values) => {
            try {
              await toastManager.promise(
                (async () => {
                  const response =
                    await securityRpc.security.help.supportTickets.create({
                      payload: values,
                    })
                  if (response.status !== "success") {
                    throw new Error(
                      serviceResponseFailureMessage(response, {
                        invalid: t("errors.invalid"),
                        fallback: t("errors.create"),
                      })
                    )
                  }
                  await refreshTickets()
                })(),
                {
                  loading: t("creating"),
                  success: t("createSuccess"),
                  error: (err) =>
                    err instanceof Error ? err.message : t("errors.create"),
                }
              )
            } catch {
              /* Toast reports failure. */
            }
          }}
          schema={schema}
          variant="embedded"
        >
          <div className="space-y-4">
            <FormKit.Field
              label={t("categoryLabel")}
              name="category"
              options={categoryOptions}
              type="select"
            />
            <FormKit.Field
              label={t("subjectLabel")}
              name="subject"
              type="text"
            />
            <FormKit.Field
              label={t("messageLabel")}
              name="message"
              type="textarea"
            />
            <FormKit.Actions>
              <FormKit.Submit />
            </FormKit.Actions>
          </div>
        </FormKit>
      </section>
    </div>
  )
}
