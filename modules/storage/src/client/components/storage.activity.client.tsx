"use client"

import { isTransientError } from "@modules/auth"
import {
  useOrgSessionActiveId,
  useOrgSessionActiveIdPending,
} from "@modules/org"
import { useQuery } from "@packages/react-query"
import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { Skeleton } from "@packages/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui/components/table"
import { Activity, HardDrive } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"

import { fetchStorageActivity } from "../hooks/storage.hook.activity-query"
import { storageActivityKey } from "../hooks/storage.hooks.keys"

const PAGE_SIZE = 25

export function StorageActivityScreen() {
  const t = useTranslations("ui")
  const format = useFormatter()
  const organizationId = useOrgSessionActiveId()
  const orgResolving = useOrgSessionActiveIdPending()
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined])
  const cursor = cursors.at(-1)

  const activity = useQuery({
    queryKey: storageActivityKey(organizationId, cursor),
    enabled: Boolean(organizationId),
    queryFn: () => fetchStorageActivity({ cursor, limit: PAGE_SIZE }),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })

  if (orgResolving) {
    return <Skeleton className="h-16 w-full" />
  }

  if (!organizationId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HardDrive />
          </EmptyMedia>
          <EmptyTitle>{t("storageNoActiveOrgTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("storageNoActiveOrgDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (activity.isPending) {
    return <Skeleton className="h-32 w-full" />
  }

  if (activity.isError || !activity.data) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("storageActivityLoadError")}
      </p>
    )
  }

  const { events, nextCursor } = activity.data
  if (events.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Activity />
          </EmptyMedia>
          <EmptyTitle>{t("storageActivityEmptyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("storageActivityEmptyDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("storageActivityEventColumn")}</TableHead>
            <TableHead>{t("storageActivityOutcomeColumn")}</TableHead>
            <TableHead>{t("storageActivityWhenColumn")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.activityId}>
              <TableCell className="font-medium">{event.actionId}</TableCell>
              <TableCell className="text-muted-foreground">
                {event.outcome}
              </TableCell>
              <TableCell>
                {format.dateTime(new Date(event.occurredAt), "dateTime")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={cursors.length <= 1}
          onClick={() => setCursors((stack) => stack.slice(0, -1))}
        >
          {t("storageActivityPreviousPage")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!nextCursor}
          onClick={() => {
            if (!nextCursor) return
            setCursors((stack) => [...stack, nextCursor])
          }}
        >
          {t("storageActivityNextPage")}
        </Button>
      </div>
    </div>
  )
}
