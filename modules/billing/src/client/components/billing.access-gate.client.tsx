"use client"

import { useShellNavigation } from "@features/shell"
import {
  isOrganizationOwnerRole,
  useOrgActiveMemberRole,
  useOrgSessionActiveId,
  useOrgSessionPending,
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
import { CreditCard } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

function BillingAccessGateSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-10 w-full max-w-md" />
    </div>
  )
}

export function BillingAccessGate(props: { children: ReactNode }) {
  const t = useTranslations("ui")
  const { Link } = useShellNavigation()
  const sessionPending = useOrgSessionPending()
  const organizationId = useOrgSessionActiveId()
  const { role, isPending: rolePending } = useOrgActiveMemberRole()

  if (sessionPending) {
    return <BillingAccessGateSkeleton />
  }

  if (!organizationId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCard />
          </EmptyMedia>
          <EmptyTitle>{t("billingNoActiveOrgTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("billingNoActiveOrgDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <Button render={<Link href="/organizations/list" />}>
          {t("organizations")}
        </Button>
      </Empty>
    )
  }

  if (!rolePending && (!role || !isOrganizationOwnerRole(role))) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCard />
          </EmptyMedia>
          <EmptyTitle>{t("billingOwnerOnlyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("billingOwnerOnlyDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (rolePending) {
    return <BillingAccessGateSkeleton />
  }

  return props.children
}
