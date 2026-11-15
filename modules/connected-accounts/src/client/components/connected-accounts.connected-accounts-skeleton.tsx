"use client"

import { Skeleton } from "@packages/ui/components/skeleton"
import { useTranslations } from "next-intl"
import { connectedAccountsLayout } from "./connected-accounts.connected-accounts-layout"

export function ConnectedAccountsLoadingSkeleton() {
  const t = useTranslations("ui")

  return (
    <div
      aria-busy="true"
      role="status"
      className={connectedAccountsLayout.list}
    >
      <span className="sr-only">{t("loading")}</span>
      <Skeleton
        aria-hidden="true"
        className={connectedAccountsLayout.skeletonRow}
      />
      <Skeleton
        aria-hidden="true"
        className={connectedAccountsLayout.skeletonRow}
      />
    </div>
  )
}
