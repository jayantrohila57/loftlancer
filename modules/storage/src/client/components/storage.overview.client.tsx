"use client"

import { useShellNavigation } from "@features/shell"
import {
  useOrgSessionActiveId,
  useOrgSessionActiveIdPending,
} from "@modules/org"
import { useAccountHubHref } from "@modules/shell"
import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@packages/ui/components/progress"
import { Skeleton } from "@packages/ui/components/skeleton"
import { FolderOpen, HardDrive } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

import { formatStorageBytesForAccount } from "../../utils/storage.format-bytes.client"
import { useStorageApi } from "../hooks/storage.api"

function StorageOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-4 w-64" />
    </div>
  )
}

export function StorageOverviewScreen() {
  const t = useTranslations("ui")
  const format = useFormatter()
  const { Link } = useShellNavigation()
  const filesHref = useAccountHubHref("/account/storage/files")
  const organizationId = useOrgSessionActiveId()
  const orgResolving = useOrgSessionActiveIdPending()
  const overview = useStorageApi.useOverview(organizationId)

  if (orgResolving) return <StorageOverviewSkeleton />

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
        <Button render={<Link href="/organizations/list" />}>
          {t("organizations")}
        </Button>
      </Empty>
    )
  }

  if (overview.isPending) return <StorageOverviewSkeleton />

  if (overview.isError || !overview.data) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("storageOverviewLoadError")}
      </p>
    )
  }

  const data = overview.data
  const usedLabel = formatStorageBytesForAccount(data.usedBytes, format)
  const quotaLabel = formatStorageBytesForAccount(data.quotaBytes, format)
  const percent = Math.min(
    100,
    data.quotaBytes > 0 ? (data.usedBytes / data.quotaBytes) * 100 : 0
  )
  const planLabel =
    data.planTier === "paid" ? t("storagePlanPaid") : t("storagePlanFree")
  const storageRootMissing = data.rootFolderId === null
  const libraryEmpty =
    data.activeItemCount === 0 && data.activeFolderCount === 0
  const quotaFull = data.quotaBytes > 0 && data.usedBytes >= data.quotaBytes

  return (
    <div className="flex flex-col gap-6">
      {storageRootMissing ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HardDrive />
            </EmptyMedia>
            <EmptyTitle>{t("storageNotProvisionedTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("storageNotProvisionedDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" onClick={() => void overview.refetch()}>
            {t("tryAgain")}
          </Button>
        </Empty>
      ) : null}
      {quotaFull ? (
        <p className="text-sm text-destructive" role="status">
          {t("storageQuotaFullNotice")}
        </p>
      ) : null}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium">{t("storageUsageHeading")}</p>
          <p className="text-sm text-muted-foreground">
            {t("storagePlanLabel", { plan: planLabel })}
          </p>
        </div>
        <Progress value={percent}>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <p className="text-sm text-muted-foreground tabular-nums">
          {t("storageUsageSummary", {
            used: usedLabel,
            quota: quotaLabel,
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("storageUsagePercent", { percent: Math.round(percent) })}
        </p>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("files")}</dt>
          <dd className="font-medium tabular-nums">{data.activeItemCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("storageFolders")}</dt>
          <dd className="font-medium tabular-nums">{data.activeFolderCount}</dd>
        </div>
      </dl>

      {!storageRootMissing ? (
        libraryEmpty ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpen />
              </EmptyMedia>
              <EmptyTitle>{t("storageLibraryEmptyTitle")}</EmptyTitle>
              <EmptyDescription>
                {t("storageLibraryEmptyDescription")}
              </EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" render={<Link href={filesHref} />}>
              {t("storageBrowseFiles")}
            </Button>
          </Empty>
        ) : (
          <Button variant="outline" render={<Link href={filesHref} />}>
            {t("storageBrowseFiles")}
          </Button>
        )
      ) : null}
    </div>
  )
}
