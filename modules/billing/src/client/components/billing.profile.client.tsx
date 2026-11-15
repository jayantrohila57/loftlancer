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
import { CreditCard, UserRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { useBillingApi } from "../hooks/billing.api"
import { markBillingPortalLaunch } from "../hooks/billing.hook.portal-return-refresh"
import { useBillingProfile } from "../hooks/billing.hook.profile"
import { BillingAccessGate } from "./billing.access-gate.client"
import { BillingQueryErrorState } from "./billing.query-error-state.client"

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-20 w-full max-w-md" />
    </div>
  )
}

export function BillingPaymentMethodsScreen() {
  const t = useTranslations("ui")
  const organizationId = useOrgSessionActiveId()
  const profile = useBillingProfile(organizationId)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSetupPayment() {
    setError(null)
    setPending(true)
    try {
      const result = await useBillingApi.postSetupPayment()
      window.location.assign(result.setupUrl)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("operationFailed"))
    } finally {
      setPending(false)
    }
  }

  return (
    <BillingAccessGate>
      {profile.isLoading ? <ProfileSkeleton /> : null}
      {profile.isError ? (
        <BillingQueryErrorState
          error={profile.error}
          isRefetching={profile.isRefetching}
          loadErrorTitle={t("billingProfileLoadError")}
          onRetry={() => {
            void profile.refetch()
          }}
        />
      ) : null}
      {profile.data && !profile.data.paymentMethod ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CreditCard />
            </EmptyMedia>
            <EmptyTitle>{t("billingPaymentMethodEmptyTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("billingPaymentMethodEmptyDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <Button disabled={pending} onClick={() => void onSetupPayment()}>
            {t("billingAddPaymentMethod")}
          </Button>
        </Empty>
      ) : null}
      {profile.data?.paymentMethod ? (
        <div className="flex flex-col gap-4 text-sm">
          <p className="flex flex-wrap gap-x-1">
            <span className="text-muted-foreground">
              {t("billingPaymentMethodOnFile")}
            </span>
            <span className="font-medium capitalize">
              {t("billingPaymentMethodMasked", {
                brand: profile.data.paymentMethod.brand,
                last4: profile.data.paymentMethod.last4,
              })}
            </span>
          </p>
          <p className="text-muted-foreground tabular-nums">
            {t("billingPaymentMethodExpires", {
              month: profile.data.paymentMethod.expMonth,
              year: profile.data.paymentMethod.expYear,
            })}
          </p>
          <Button
            disabled={pending}
            variant="outline"
            onClick={() => void onSetupPayment()}
          >
            {t("billingUpdatePaymentMethod")}
          </Button>
        </div>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </BillingAccessGate>
  )
}

export function BillingDetailsScreen() {
  const t = useTranslations("ui")
  const organizationId = useOrgSessionActiveId()
  const profile = useBillingProfile(organizationId)
  const [portalPending, setPortalPending] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  return (
    <BillingAccessGate>
      {profile.isLoading ? <ProfileSkeleton /> : null}
      {profile.isError ? (
        <BillingQueryErrorState
          error={profile.error}
          isRefetching={profile.isRefetching}
          loadErrorTitle={t("billingProfileLoadError")}
          onRetry={() => {
            void profile.refetch()
          }}
        />
      ) : null}
      {profile.data && !profile.data.billingDetails ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserRound />
            </EmptyMedia>
            <EmptyTitle>
              {profile.data.billingDetailsAvailable === false
                ? t("billingProfileLoadError")
                : t("billingDetailsEmptyTitle")}
            </EmptyTitle>
            <EmptyDescription>
              {profile.data.billingDetailsAvailable === false
                ? t("billingDetailsUnavailableDescription")
                : t("billingDetailsEmptyDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <Button
            disabled={portalPending}
            variant="outline"
            onClick={() => {
              setPortalError(null)
              setPortalPending(true)
              void useBillingApi
                .postPortal()
                .then((result) => {
                  markBillingPortalLaunch()
                  window.location.assign(result.portalUrl)
                })
                .catch((error: unknown) => {
                  setPortalError(
                    error instanceof Error
                      ? error.message
                      : t("operationFailed")
                  )
                })
                .finally(() => {
                  setPortalPending(false)
                })
            }}
          >
            {t("billingManagePortal")}
          </Button>
          {portalError ? (
            <p className="text-sm text-destructive" role="alert">
              {portalError}
            </p>
          ) : null}
        </Empty>
      ) : null}
      {profile.data?.billingDetails ? (
        <dl className="grid max-w-md gap-3 text-sm">
          {profile.data.name ? (
            <div>
              <dt className="text-muted-foreground">{t("name")}</dt>
              <dd>{profile.data.name}</dd>
            </div>
          ) : null}
          {profile.data.email ? (
            <div>
              <dt className="text-muted-foreground">{t("email")}</dt>
              <dd>{profile.data.email}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted-foreground">{t("billingAddress")}</dt>
            <dd>
              {[
                profile.data.billingDetails.line1,
                profile.data.billingDetails.line2,
                profile.data.billingDetails.city,
                profile.data.billingDetails.state,
                profile.data.billingDetails.postalCode,
                profile.data.billingDetails.country,
              ]
                .filter(Boolean)
                .join(", ") || "—"}
            </dd>
          </div>
          {profile.data.billingDetails.taxIds.length > 0 ? (
            <div>
              <dt className="text-muted-foreground">{t("billingTaxIds")}</dt>
              <dd>{profile.data.billingDetails.taxIds.join(", ")}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </BillingAccessGate>
  )
}
