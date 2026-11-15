"use client"

import {
  useOrgSessionActiveId,
  useOrgSessionActiveIdPending,
} from "@modules/org"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { Skeleton } from "@packages/ui/components/skeleton"
import { Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"

function AiUsageModelUsageSkeleton() {
  return <Skeleton className="h-4 w-full max-w-md" />
}

export function AiUsageModelUsageScreen() {
  const t = useTranslations("ui")
  const orgResolving = useOrgSessionActiveIdPending()
  const organizationId = useOrgSessionActiveId()

  if (orgResolving) return <AiUsageModelUsageSkeleton />

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
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground" role="status">
        {t("aiUsageModelUsageBlockedDescription")}
      </p>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>{t("aiUsageModelUsageEmptyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("aiUsageModelUsageEmptyDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
