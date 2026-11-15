"use client"

import { useShellNavigation } from "@features/shell"
import {
  useOrgSessionActiveId,
  useOrgSessionActiveIdPending,
} from "@modules/org"
import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { Skeleton } from "@packages/ui/components/skeleton"
import { Sparkles } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"

import { useAiUsageApi } from "../hooks/ai-usage.api"

function AiUsageHistorySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-full max-w-lg" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-full max-w-sm" />
    </div>
  )
}

export function AiUsageHistoryScreen() {
  const t = useTranslations("ui")
  const format = useFormatter()
  const { Link } = useShellNavigation()
  const orgResolving = useOrgSessionActiveIdPending()
  const organizationId = useOrgSessionActiveId()
  const [cursor, setCursor] = useState<string | null>(null)
  const [cursorStack, setCursorStack] = useState<readonly (string | null)[]>([])
  const history = useAiUsageApi.useUsageHistory(organizationId, cursor)

  if (orgResolving) return <AiUsageHistorySkeleton />

  if (!organizationId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>{t("aiUsageNoActiveOrgTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("aiUsageNoActiveOrgDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <Button render={<Link href="/organizations/list" />}>
          {t("organizations")}
        </Button>
      </Empty>
    )
  }

  if (history.isPending) return <AiUsageHistorySkeleton />

  if (history.isError || !history.data) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("aiUsageHistoryLoadError")}
      </p>
    )
  }

  const data = history.data

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground" role="status">
        {t("aiUsageMeteredRoutesPendingDescription")}
      </p>

      {data.totalSettledCount === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkles />
            </EmptyMedia>
            <EmptyTitle>{t("aiUsageHistoryEmptyTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("aiUsageHistoryEmptyDescription")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ul className="divide-y rounded-md border text-sm">
            {data.items.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 px-3 py-2"
              >
                <span className="text-muted-foreground">
                  {format.dateTime(new Date(entry.settledAt), "dateTime")}
                </span>
                <span className="font-medium tabular-nums">
                  {t("aiUsageHistoryCreditsDebited", { count: entry.amount })}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={cursorStack.length === 0}
              onClick={() => {
                const prior = cursorStack.at(-1) ?? null
                setCursorStack((stack) => stack.slice(0, -1))
                setCursor(prior ?? null)
              }}
            >
              {t("previous")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!data.nextCursor}
              onClick={() => {
                if (!data.nextCursor) return
                setCursorStack((stack) => [...stack, cursor])
                setCursor(data.nextCursor)
              }}
            >
              {t("next")}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
