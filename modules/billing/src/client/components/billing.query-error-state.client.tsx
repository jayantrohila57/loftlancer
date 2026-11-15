"use client"

import { useShellNavigation } from "@features/shell"
import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { CreditCard } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  isBillingQueryRetryable,
  readBillingClientErrorCode,
} from "../../utils/billing.client-error"

function BillingCustomerUnboundState() {
  const t = useTranslations("ui")
  const { Link } = useShellNavigation()

  return (
    <Empty role="status">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CreditCard />
        </EmptyMedia>
        <EmptyTitle>{t("billingCustomerUnboundTitle")}</EmptyTitle>
        <EmptyDescription>
          {t("billingCustomerUnboundDescription")}
        </EmptyDescription>
      </EmptyHeader>
      <Button render={<Link href="/account/subscription/available-plans" />}>
        {t("availablePlans")}
      </Button>
    </Empty>
  )
}

export function BillingQueryErrorState(props: {
  error: unknown
  loadErrorTitle: string
  isRefetching?: boolean
  onRetry?: () => void
}) {
  const t = useTranslations("ui")
  const code = readBillingClientErrorCode(props.error)

  if (code === "billing.autumn_unconfigured") {
    return (
      <Empty role="status">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCard />
          </EmptyMedia>
          <EmptyTitle>{t("billingAutumnUnconfiguredTitle")}</EmptyTitle>
          <EmptyDescription>{t("billingAutumnUnconfigured")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (code === "billing.customer_unbound") {
    return <BillingCustomerUnboundState />
  }

  return (
    <Empty role="status">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CreditCard />
        </EmptyMedia>
        <EmptyTitle>{props.loadErrorTitle}</EmptyTitle>
        {props.error instanceof Error && props.error.message ? (
          <EmptyDescription>{props.error.message}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {props.onRetry && isBillingQueryRetryable(props.error) ? (
        <Button
          disabled={props.isRefetching}
          type="button"
          variant="outline"
          onClick={props.onRetry}
        >
          {t("tryAgain")}
        </Button>
      ) : null}
    </Empty>
  )
}
