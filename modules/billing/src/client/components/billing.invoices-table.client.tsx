"use client"

import { useOrgSessionActiveId } from "@modules/org"
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
import { Receipt } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import { normalizeHostedInvoiceUrl } from "../../utils/billing.invoice-row"
import { useBillingInvoices } from "../hooks/billing.hook.invoices"
import { BillingAccessGate } from "./billing.access-gate.client"
import { BillingQueryErrorState } from "./billing.query-error-state.client"

function InvoicesSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

type InvoicesListResult = ReturnType<typeof useBillingInvoices> & {
  readonly pagination?: {
    readonly cursors: readonly (string | null | undefined)[]
    readonly onPrevious: () => void
    readonly onNext: () => void
  }
}

function BillingInvoicesTableBody(props: {
  variant: "invoices" | "payment-history"
  list: InvoicesListResult
}) {
  const t = useTranslations("ui")
  const format = useFormatter()

  if (props.list.isLoading) {
    return <InvoicesSkeleton />
  }

  if (props.list.isError) {
    return (
      <BillingQueryErrorState
        error={props.list.error}
        loadErrorTitle={
          props.variant === "payment-history"
            ? t("billingPaymentHistoryLoadError")
            : t("billingInvoicesLoadError")
        }
        onRetry={() => {
          props.list.refetch().catch(() => {})
        }}
      />
    )
  }

  if (!props.list.data) {
    return null
  }

  if (props.list.data.invoices.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Receipt />
          </EmptyMedia>
          <EmptyTitle>
            {props.variant === "payment-history"
              ? t("billingPaymentHistoryEmptyTitle")
              : t("billingInvoicesEmptyTitle")}
          </EmptyTitle>
          <EmptyDescription>
            {props.variant === "payment-history"
              ? t("billingPaymentHistoryEmptyDescription")
              : t("billingInvoicesEmptyDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("billingInvoiceDate")}</TableHead>
            <TableHead>{t("billingInvoiceStatus")}</TableHead>
            <TableHead className="text-right">
              {t("billingInvoiceAmount")}
            </TableHead>
            <TableHead className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.list.data.invoices.map((invoice) => {
            const hostedInvoiceUrl = normalizeHostedInvoiceUrl(
              invoice.hostedInvoiceUrl
            )
            const invoicePdfUrl = normalizeHostedInvoiceUrl(
              invoice.invoicePdfUrl ?? invoice.hostedInvoiceUrl
            )
            return (
              <TableRow key={invoice.id}>
                <TableCell className="tabular-nums">
                  {format.dateTime(new Date(invoice.createdAt), "shortDate")}
                </TableCell>
                <TableCell className="capitalize">{invoice.status}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {format.number(invoice.totalMinor / 100, {
                    style: "currency",
                    currency: invoice.currency.toUpperCase(),
                  })}
                </TableCell>
                <TableCell>
                  <span className="flex flex-wrap justify-end gap-2">
                    {hostedInvoiceUrl ? (
                      <a
                        className="text-sm text-primary underline-offset-4 hover:underline"
                        href={hostedInvoiceUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {t("billingInvoiceView")}
                      </a>
                    ) : null}
                    {invoicePdfUrl ? (
                      <a
                        className="text-sm text-primary underline-offset-4 hover:underline"
                        href={invoicePdfUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {t("billingInvoicePdf")}
                      </a>
                    ) : null}
                    {!hostedInvoiceUrl && !invoicePdfUrl ? "—" : null}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {props.list.pagination ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={props.list.pagination.cursors.length <= 1}
            onClick={props.list.pagination.onPrevious}
          >
            {t("previous")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!props.list.data.nextCursor}
            onClick={props.list.pagination.onNext}
          >
            {t("next")}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function BillingInvoicesTableScreen(props: {
  variant: "invoices" | "payment-history"
}) {
  const organizationId = useOrgSessionActiveId()
  const [cursors, setCursors] = useState<
    readonly (string | null | undefined)[]
  >([undefined])
  const activeCursor = cursors[cursors.length - 1]
  const list = useBillingInvoices(organizationId, props.variant, activeCursor)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset cursors when org or tab changes (AUTH-REM-26)
  useEffect(() => {
    setCursors([undefined])
  }, [organizationId, props.variant])

  const pagination = useMemo(
    () => ({
      cursors,
      onPrevious: () => {
        setCursors((values) =>
          values.length > 1 ? values.slice(0, -1) : values
        )
      },
      onNext: () => {
        if (!list.data?.nextCursor) return
        setCursors((values) => [...values, list.data.nextCursor])
      },
    }),
    [cursors, list.data?.nextCursor]
  )

  return (
    <BillingAccessGate>
      <BillingInvoicesTableBody
        variant={props.variant}
        list={{ ...list, pagination }}
      />
    </BillingAccessGate>
  )
}
